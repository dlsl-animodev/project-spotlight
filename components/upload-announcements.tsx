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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { addDoc } from "firebase/firestore";
import z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { announcementsRef } from "@/libs/collections";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadFilmProps {
  onSuccess?: () => void;
}

const announcementSchema = z.object({
  message: z.string().min(1, "Announcement cannot be empty"),
  expiresAt: z.date(),
});

type AnnouncementData = z.infer<typeof announcementSchema>;

export default function UploadAnnouncements({ onSuccess }: UploadFilmProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AnnouncementData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      message: "",
    },
  });

  async function handleSubmit(data: AnnouncementData) {
    try {
      setIsLoading(true);

      const expirationDate = data.expiresAt;
      const now = new Date();

      if (expirationDate <= now) {
        toast.error("Expiration date must be in the future");
        setIsLoading(false);
        return;
      }

      await addDoc(announcementsRef, {
        message: data.message,
        createdAt: new Date(),
        expiresAt: expirationDate,
      });

      form.reset();
      setOpen(false);

      window.dispatchEvent(new CustomEvent("announcementAdded"));

      toast.success("Announcement added successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Error adding announcement:", error);
      toast.error("Failed to add announcement. Please try again.");
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
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                placeholder="Write your announcement here..."
                className="min-h-[140px]"
                {...form.register("message")}
              />
              {form.formState.errors.message && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.message.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Expires On
              </label>
              <Controller
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
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
                          format(field.value, "PPP p")
                        ) : (
                          <span>Pick expiration date and time</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            const now = new Date();
                            date.setHours(now.getHours(), now.getMinutes());
                            field.onChange(date);
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <label className="text-xs font-medium mb-2 block">
                          Time
                        </label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          value={
                            field.value ? format(field.value, "HH:mm") : ""
                          }
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = field.value
                              ? new Date(field.value)
                              : new Date();
                            newDate.setHours(
                              parseInt(hours),
                              parseInt(minutes)
                            );
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {form.formState.errors.expiresAt && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.expiresAt.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
