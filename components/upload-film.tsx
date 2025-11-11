"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Upload, Film } from "lucide-react";
import { addDoc } from "firebase/firestore";
import { filmsRef } from "@/libs/collections";

const filmUploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  actors: z.string().min(1, "At least one actor is required"),
  director: z.string().optional(),
  genre: z.string().min(1, "At least one genre is required"),
  releaseDate: z.string().min(1, "Release date is required"),
  duration: z.string().optional(),
  rating: z.string().optional(),
  featured: z.boolean().optional(),
  file: z
    .any()
    .refine((file) => file instanceof File, "Video file is required"),
  thumbnail: z
    .any()
    .refine((file) => file instanceof File, "Thumbnail file is required"),
});

type FormData = z.infer<typeof filmUploadSchema>;

export default function UploadFilm() {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(filmUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      actors: "",
      director: "",
      genre: "",
      releaseDate: "",
      duration: "",
      rating: "",
      featured: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsUploading(true);
      console.log("Form data:", data);

      // Upload file to R2
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("title", data.title);

      const uploadResponse = await fetch("/api/upload/film", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const { key } = await uploadResponse.json();

      const thumbnailFormData = new FormData();
      thumbnailFormData.append("thumbnail", data.thumbnail);
      thumbnailFormData.append("title", data.title);
      const thumbnailUploadResponse = await fetch("/api/upload/thumbnail", {
        method: "POST",
        body: thumbnailFormData,
      });

      if (!thumbnailUploadResponse.ok) {
        throw new Error("Failed to upload thumbnail");
      }

      const { thumbnailKey } = await thumbnailUploadResponse.json();

      // convert comma-separated strings to arrays for Firestore fields
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

      // Add document to Firestore
      await addDoc(filmsRef, {
        title: data.title,
        description: data.description,
        actors: actorsArray,
        director: data.director || "",
        genre: genreArray,
        releaseDate: data.releaseDate,
        duration: data.duration ? Number(data.duration) : undefined,
        rating: data.rating,
        featured: data.featured,
        id: "",
        createdAt: new Date().toISOString(),
        // Store the R2 key for the video file
        key: key,
        thumbnailKey: thumbnailKey,
      });

      // Reset form and close dialog
      form.reset();
      setOpen(false);
      alert("Film uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload film. Please try again.");
    } finally {
      setIsUploading(false);
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
                      <Input type="date" {...field} />
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
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
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
