"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Upload, Film, CalendarIcon } from "lucide-react";
import {
  addDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { filmsRef } from "@/libs/collections";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const filmUploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  actors: z.string().min(1, "At least one actor is required"),
  director: z.string().optional(),
  genre: z.string().min(1, "At least one genre is required"),
  releaseDate: z.date(),
  duration: z.string().optional(),
  rating: z.string().optional(),
  featured: z.boolean().optional(),
  file: z
    .any()
    .refine((file) => file instanceof File, "Video file is required"),
  thumbnail: z
    .any()
    .refine((file) => file instanceof File, "Thumbnail file is required"),
  coverphoto: z
    .any()
    .refine((file) => file instanceof File, "Cover photo file is required"),
});

type FormData = z.infer<typeof filmUploadSchema>;

interface UploadFilmProps {
  onSuccess?: () => void;
}

// Helper function to upload file directly to R2 using presigned URL
async function uploadToR2(
  file: File,
  folder: string,
  title: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Get presigned URL from our API
  const response = await fetch("/api/presigned-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: `${title}-${file.name}`,
      contentType: file.type,
      folder,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get presigned URL");
  }

  const { presignedUrl, key } = await response.json();

  // Upload directly to R2 using XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(key);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"));
    });

    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

export default function UploadFilm({ onSuccess }: UploadFilmProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    video: 0,
    thumbnail: 0,
    coverphoto: 0,
  });
  const [currentUpload, setCurrentUpload] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(filmUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      actors: "",
      director: "",
      genre: "",
      duration: "",
      rating: "",
      featured: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsUploading(true);
      setUploadProgress({ video: 0, thumbnail: 0, coverphoto: 0 });

      // Check storage limit before uploading
      setCurrentUpload("Checking storage...");
      const statsResponse = await fetch("/api/bucket-stats");
      if (statsResponse.ok) {
        const stats = await statsResponse.json();

        // Calculate total upload size
        const totalUploadSize =
          (data.file.size + data.thumbnail.size + data.coverphoto.size) /
          (1024 * 1024 * 1024); // in GB

        if (stats.isOverLimit) {
          toast.error("Storage limit exceeded! Cannot upload more files.");
          return;
        }

        if (stats.remainingGB < totalUploadSize) {
          toast.error(
            `Not enough storage! Need ${totalUploadSize.toFixed(
              2
            )}GB but only ${stats.remainingGB.toFixed(2)}GB remaining.`
          );
          return;
        }

        if (stats.usagePercentage > 90) {
          toast.warning(
            `Storage almost full! ${stats.usagePercentage.toFixed(1)}% used.`
          );
        }
      }

      const sanitizedTitle = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Upload video file directly to R2
      setCurrentUpload("Uploading video...");
      const videoKey = await uploadToR2(
        data.file,
        "videos",
        sanitizedTitle,
        (progress) =>
          setUploadProgress((prev) => ({ ...prev, video: progress }))
      );

      // Upload thumbnail directly to R2
      setCurrentUpload("Uploading thumbnail...");
      const thumbnailKey = await uploadToR2(
        data.thumbnail,
        "thumbnail",
        sanitizedTitle,
        (progress) =>
          setUploadProgress((prev) => ({ ...prev, thumbnail: progress }))
      );

      // Upload cover photo directly to R2
      setCurrentUpload("Uploading cover photo...");
      const coverphotoKey = await uploadToR2(
        data.coverphoto,
        "coverphoto",
        sanitizedTitle,
        (progress) =>
          setUploadProgress((prev) => ({ ...prev, coverphoto: progress }))
      );

      setCurrentUpload("Saving to database...");

      // Convert comma-separated strings to arrays for Firestore fields
      const genreArray = data.genre
        ? data.genre
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean)
        : [];
      const actorsArray = data.actors
        ? data.actors
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : [];

      // If marking as featured, un-feature other films
      if (data.featured) {
        const featuredSnap = await getDocs(
          query(filmsRef, where("featured", "==", true))
        );
        await Promise.all(
          featuredSnap.docs.map((d) =>
            updateDoc(doc(filmsRef, d.id), { featured: false })
          )
        );
      }

      // Add document to Firestore
      await addDoc(filmsRef, {
        title: data.title,
        description: data.description,
        actors: actorsArray,
        director: data.director || "",
        genre: genreArray,
        releaseDate: data.releaseDate.toISOString(),
        duration: data.duration ? Number(data.duration) : undefined,
        rating: data.rating,
        featured: data.featured,
        status: "released",
        viewCount: 0,
        id: "",
        createdAt: new Date().toISOString(),
        // Store the R2 keys for the files
        key: videoKey,
        thumbnailKey: thumbnailKey,
        coverphotoKey: coverphotoKey,
      });

      // Reset form and close dialog
      form.reset();
      setOpen(false);
      setCurrentUpload("");
      toast.success("Film uploaded successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload film. Please try again.");
    } finally {
      setIsUploading(false);
      setCurrentUpload("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Film
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Upload New Film
          </DialogTitle>
          <DialogDescription>
            Fill in the film details and upload the video file. Required fields
            are marked with *.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter film title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter film description"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="actors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actors/Actresses *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe, Jane Smith" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Comma-separated
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="director"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Director</FormLabel>
                    <FormControl>
                      <Input placeholder="Director name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Action, Drama" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Comma-separated
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="releaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Date *</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a release date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input placeholder="PG-13, R, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="file"
              render={({ field: { ref, name, onBlur, onChange } }) => (
                <FormItem>
                  <FormLabel>Video File *</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="video/*"
                      ref={ref}
                      name={name}
                      onBlur={onBlur}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Upload the video file for this film
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field: { ref, name, onBlur, onChange } }) => (
                <FormItem>
                  <FormLabel>Thumbnail *</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      ref={ref}
                      name={name}
                      onBlur={onBlur}
                      onChange={(e) => {
                        const thumbnailFile = e.target.files?.[0];
                        if (thumbnailFile) {
                          onChange(thumbnailFile);
                        }
                      }}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverphoto"
              render={({ field: { ref, name, onBlur, onChange } }) => (
                <FormItem>
                  <FormLabel>Cover Photo *</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      ref={ref}
                      name={name}
                      onBlur={onBlur}
                      onChange={(e) => {
                        const coverPhotoFile = e.target.files?.[0];
                        if (coverPhotoFile) {
                          onChange(coverPhotoFile);
                        }
                      }}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4"
                    />
                  </FormControl>
                  <FormLabel className="mt-0 font-normal">
                    Mark as featured
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* Upload Progress Section */}
            {isUploading && (
              <div className="space-y-3 rounded-lg bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-700">
                  {currentUpload}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Video</span>
                    <span>{uploadProgress.video}%</span>
                  </div>
                  <Progress value={uploadProgress.video} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Thumbnail</span>
                    <span>{uploadProgress.thumbnail}%</span>
                  </div>
                  <Progress value={uploadProgress.thumbnail} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Cover Photo</span>
                    <span>{uploadProgress.coverphoto}%</span>
                  </div>
                  <Progress value={uploadProgress.coverphoto} className="h-2" />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Film"}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
