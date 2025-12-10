"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { addDoc } from "firebase/firestore";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { announcementsRef } from "@/libs/collections";
import { toast } from "sonner";

interface UploadFilmProps {
  onSuccess?: () => void;
}

const announcementSchema = z.object({
  message: z.string().min(1, "Announcement cannot be empty"),
});

type AnnouncementData = z.infer<typeof announcementSchema>;

export default function UploadAnnouncements({ onSuccess }: UploadFilmProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AnnouncementData>({
    resolver: zodResolver(announcementSchema),
  });

  async function handleSubmit(data: AnnouncementData) {
    try {
      setIsLoading(true);
      await addDoc(announcementsRef, {
        message: data.message,
        createdAt: new Date(),
      });

      form.reset();
      setOpen(false);

      window.dispatchEvent(new CustomEvent("announcementAdded"));

      toast.success("Announcement added successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Error adding announcement:", error);
      toast.error("Failed to add announcement. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-red-600 hover:bg-red-700">
            Add Announcement
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
          </DialogHeader>

          <Textarea
            placeholder="Write your announcement here..."
            className="min-h-[140px]"
            {...form.register("message")}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
