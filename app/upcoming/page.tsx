"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/libs/firebase";
import { Film } from "@/type/film-type";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Sparkles,
  ArrowLeft,
  Bell,
  BellOff,
} from "lucide-react";
import Link from "next/link";
import ThumbnailImage from "@/components/thumbnail-image";
import CoverPhotoImage from "@/components/coverphoto-image";

// Calculate days until release
const getDaysUntil = (dateString: string) => {
  const release = new Date(dateString);
  const today = new Date();
  const diff = Math.ceil(
    (release.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
};

// Format date nicely
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function UpcomingPage() {
  const [upcomingFilms, setUpcomingFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifyList, setNotifyList] = useState<string[]>([]);

  // Fetch upcoming films from Firebase
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const filmsRef = collection(db, "films");
        const q = query(
          filmsRef,
          where("status", "in", ["upcoming", "coming-soon"])
        );
        const snapshot = await getDocs(q);
        const films = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Film[];

        // Sort by release date (closest first)
        films.sort(
          (a, b) =>
            new Date(a.releaseDate).getTime() -
            new Date(b.releaseDate).getTime()
        );

        setUpcomingFilms(films);
      } catch (error) {
        console.error("Error fetching upcoming films:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, []);

  const toggleNotify = (id: string) => {
    setNotifyList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-zinc-100">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-6">
          {/* Left: Back Button */}
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-600 hover:text-red-600 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          {/* Center: Logo */}
          <Link href="/">
            <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-black tracking-tight text-red-600 md:text-3xl">
              SPOTLIGHT
            </h1>
          </Link>

          {/* Right: Nav Links */}
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/upcoming" className="text-red-600">
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
      </header>

      {/* Main Content */}
      <main className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-16 md:py-24">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
            <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-600/20 px-4 py-2 text-sm font-medium text-red-400">
                <Sparkles className="h-4 w-4" />
                Coming Soon
              </span>
              <h1 className="mt-4 text-4xl font-black text-white md:text-5xl lg:text-6xl">
                Upcoming <span className="text-red-500">Films</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
                Get a sneak peek at the films coming to Project Spotlight. Stay
                tuned for new releases from our talented student filmmakers.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Films List */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
              </div>
            ) : upcomingFilms.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-20 text-center"
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
                  <Calendar className="h-10 w-10 text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">
                  No Upcoming Films Yet
                </h3>
                <p className="mt-2 text-zinc-500">
                  Check back soon for new releases from our filmmakers.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
                >
                  Browse Current Films
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {upcomingFilms.map((film, index) => (
                  <motion.div
                    key={film.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-3xl bg-zinc-50 md:flex"
                  >
                    {/* Cover Image */}
                    <div className="relative aspect-video w-full overflow-hidden md:aspect-auto md:min-h-[300px] md:w-2/5">
                      {film.coverphotoKey ? (
                        <div className="absolute inset-0">
                          <CoverPhotoImage
                            coverphotoKey={film.coverphotoKey}
                            alt={film.title}
                            className="transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : film.thumbnailKey ? (
                        <div className="absolute inset-0">
                          <CoverPhotoImage
                            coverphotoKey={film.thumbnailKey}
                            alt={film.title}
                            className="transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex h-full min-h-[240px] w-full items-center justify-center bg-gradient-to-br from-red-600 to-red-700">
                          <Sparkles className="h-16 w-16 text-white/50" />
                        </div>
                      )}

                      {/* Days Badge */}
                      <div className="absolute left-4 top-4">
                        <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg">
                          <Calendar className="h-4 w-4" />
                          {getDaysUntil(film.releaseDate) > 0
                            ? `${getDaysUntil(film.releaseDate)} days`
                            : "Coming Soon"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
                      <div>
                        {/* Genres */}
                        <div className="mb-3 flex flex-wrap gap-2">
                          {film.genre?.map((g) => (
                            <span
                              key={g}
                              className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600"
                            >
                              {g}
                            </span>
                          ))}
                          <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600">
                            {film.status === "coming-soon"
                              ? "Coming Soon"
                              : "Upcoming"}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-black text-zinc-900 md:text-3xl">
                          {film.title}
                        </h2>

                        {/* Description */}
                        <p className="mt-3 line-clamp-3 text-zinc-600">
                          {film.description}
                        </p>

                        {/* Meta Info */}
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {formatDate(film.releaseDate)}
                          </span>
                          {film.duration && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {film.duration} min
                            </span>
                          )}
                          {film.director && (
                            <span>Directed by {film.director}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex items-center gap-3">
                        <button
                          onClick={() => toggleNotify(film.id)}
                          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                            notifyList.includes(film.id)
                              ? "bg-red-600 text-white"
                              : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                          }`}
                        >
                          {notifyList.includes(film.id) ? (
                            <>
                              <BellOff className="h-4 w-4" />
                              Notified
                            </>
                          ) : (
                            <>
                              <Bell className="h-4 w-4" />
                              Notify Me
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <section className="border-t border-zinc-100 py-8">
          <div className="mx-auto max-w-6xl px-4 text-center md:px-6">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} Project Spotlight — Animo.dev × Film
              Society
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
