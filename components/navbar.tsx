"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { announcementsRef } from "@/libs/collections";
import { Announcement } from "@/type/film-type";
import { db } from "@/libs/firebase";

export async function fetchAnnouncements() {
  try {
    const now = new Date();
    const q = query(announcementsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const deletePromises: Promise<void>[] = [];
    let latestValid: Announcement | null = null;

    snapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data() as Announcement;
      const expiresAt =
        data.expiresAt instanceof Date
          ? data.expiresAt
          : (data.expiresAt as any)?.toDate?.() || new Date(data.expiresAt);

      if (expiresAt <= now) {
        deletePromises.push(
          deleteDoc(doc(db, "announcements", docSnapshot.id))
        );
      } else if (!latestValid) {
        latestValid = { ...data, id: docSnapshot.id };
      }
    });

    if (deletePromises.length) {
      await Promise.all(deletePromises);
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
      {/* Mobile layout */}
      <div className="flex h-14 items-center justify-between px-4 md:hidden">
        <Link href="/">
          <h1 className="text-2xl font-black tracking-tight text-red-600">
            SPOTLIGHT
          </h1>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
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

      <div className="hidden h-16 grid-cols-3 items-center px-6 md:grid">
        <div />

        <Link href="/" className="justify-self-center">
          <h1 className="text-3xl font-black tracking-tight text-red-600">
            SPOTLIGHT
          </h1>
        </Link>

        <nav className="flex items-center justify-end gap-8 text-sm font-medium mr-12">
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

  useEffect(() => {
    const load = async () => {
      const latest = await fetchAnnouncements();
      setAnnouncement(latest);
    };

    load();
    window.addEventListener("announcementAdded", load);
    return () => window.removeEventListener("announcementAdded", load);
  }, []);

  if (!announcement) return null;

  return (
    <div className="bg-red-600 text-white text-center">
      <p className="text-sm md:text-base">{announcement.message}</p>
    </div>
  );
}
