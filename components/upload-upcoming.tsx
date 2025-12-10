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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Upload, Sparkles, CalendarIcon } from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/libs/firebase";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const upcomingFilmSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  actors: z.string().optional(),
  director: z.string().optional(),
  genre: z.string().min(1, "At least one genre is required"),
  releaseDate: z.date(),
  duration: z.string().optional(),
  rating: z.string().optional(),
  featured: z.boolean().optional(),
  thumbnail: z.any().optional(),
  coverphoto: z.any().optional(),
});

type FormData = z.infer<typeof upcomingFilmSchema>;

interface UploadUpcomingProps {
  onSuccess?: () => void;
}

export default function UploadUpcoming({ onSuccess }: UploadUpcomingProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(upcomingFilmSchema),
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
      console.log("Form data:", data);

      let thumbnailKey = "";
      let coverphotoKey = "";

      // Upload thumbnail and coverphoto if provided
      if (data.thumbnail instanceof File || data.coverphoto instanceof File) {
        const thumbnailFormData = new FormData();
        if (data.thumbnail instanceof File) {
          thumbnailFormData.append("thumbnail", data.thumbnail);
        }
        if (data.coverphoto instanceof File) {
          thumbnailFormData.append("coverphoto", data.coverphoto);
        }
        thumbnailFormData.append("title", data.title);

        const thumbnailUploadResponse = await fetch("/api/upload/thumbnail", {
          method: "POST",
          body: thumbnailFormData,
        });

        if (thumbnailUploadResponse.ok) {
          const result = await thumbnailUploadResponse.json();
          thumbnailKey = result.thumbnailKey || "";
          coverphotoKey = result.coverphotoKey || "";
        }
      }

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

      // Add document to Firestore with status: "upcoming"
      await addDoc(collection(db, "films"), {
        title: data.title,
        description: data.description,
        actors: actorsArray,
        director: data.director || "",
        genre: genreArray,
        releaseDate: data.releaseDate.toISOString(),
        duration: data.duration ? Number(data.duration) : undefined,
        rating: data.rating,
        featured: data.featured,
        status: "upcoming", // Mark as upcoming film
        createdAt: new Date().toISOString(),
        // No video key for upcoming films
        key: "",
        thumbnailKey: thumbnailKey,
        coverphotoKey: coverphotoKey,
      });

      // Reset form and close dialog
      form.reset();
      setOpen(false);
      toast.success("Upcoming film added successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to add upcoming film. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Add Upcoming Film
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-red-500" />
            Add Upcoming Film
          </DialogTitle>
          <DialogDescription>
            Add a film that&apos;s coming soon. You can add the video later when
            it&apos;s ready for release.
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
                      placeholder="Enter film description or teaser"
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
                    <FormLabel>Actors/Actresses</FormLabel>
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
                    <FormLabel>Expected Release Date *</FormLabel>
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
                              <span>Pick expected release date</span>
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
              name="thumbnail"
              render={({ field: { ref, name, onBlur, onChange } }) => (
                <FormItem>
                  <FormLabel>Thumbnail (Optional)</FormLabel>
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
                  <FormDescription className="text-xs">
                    Poster image for the upcoming film
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverphoto"
              render={({ field: { ref, name, onBlur, onChange } }) => (
                <FormItem>
                  <FormLabel>Cover Photo (Optional)</FormLabel>
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
                  <FormDescription className="text-xs">
                    Wide banner image for the film
                  </FormDescription>
                  <FormMessage />
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
                {isUploading ? "Adding..." : "Add Upcoming Film"}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
