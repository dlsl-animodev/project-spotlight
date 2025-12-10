"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getDocs,
  query,
  orderBy,
  limit,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { announcementsRef } from "@/libs/collections";
import { Announcement } from "@/type/film-type";
import { db } from "@/libs/firebase";

export async function fetchAnnouncements() {
  try {
    const now = new Date();

    // Get all announcements
    const q = query(announcementsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    // Delete expired announcements
    const deletePromises: Promise<void>[] = [];
    let latestValid: Announcement | null = null;

    snapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data() as Announcement;
      const expiresAt =
        data.expiresAt instanceof Date
          ? data.expiresAt
          : (data.expiresAt as any)?.toDate?.() || new Date(data.expiresAt);

      if (expiresAt <= now) {
        // Delete expired announcement
        deletePromises.push(
          deleteDoc(doc(db, "announcements", docSnapshot.id))
        );
      } else if (!latestValid) {
        // Keep the first non-expired announcement
        latestValid = { ...data, id: docSnapshot.id };
      }
    });

    // Execute all deletions
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`Deleted ${deletePromises.length} expired announcement(s)`);
    }

    return latestValid;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return null;
  }
}

export default function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-6">
        {/* Mobile: Logo left */}
        <h1 className="text-2xl font-black tracking-tight text-red-600 md:hidden">
          SPOTLIGHT
        </h1>

        {/* Desktop: Center logo */}
        <Link href="/">
          <h1 className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-black tracking-tight text-red-600 md:text-3xl">
            SPOTLIGHT
          </h1>
        </Link>

        {/* Right: Nav Links */}
        <nav className="flex items-center gap-4 text-sm font-medium ml-auto">
          <Link
            href="/upcoming"
            className="text-zinc-600 hover:text-red-600 transition"
          >
            Upcoming
          </Link>
          <Link
            href="/about"
            className="text-zinc-600 hover:text-red-600 transition"
          >
            About
          </Link>
        </nav>
      </div>
      <Announcements />
    </header>
  );
}

function Announcements() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  const loadAnnouncement = async () => {
    const latest = await fetchAnnouncements();
    setAnnouncement(latest);
  };

  useEffect(() => {
    loadAnnouncement();

    // Listen for custom event when announcement is added
    const handleAnnouncementAdded = () => {
      loadAnnouncement();
    };

    window.addEventListener("announcementAdded", handleAnnouncementAdded);

    return () => {
      window.removeEventListener("announcementAdded", handleAnnouncementAdded);
    };
  }, []);

  if (!announcement) return null;

  return (
    <div className="bg-red-600 text-white text-center">
      <p className="text-sm md:text-base">{announcement.message}</p>
    </div>
  );
}
