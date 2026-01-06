"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/libs/firebase";
import { Film } from "@/type/film-type";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ThumbnailImage from "./thumbnail-image";

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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function UpcomingFilms() {
  const [upcomingFilms, setUpcomingFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch upcoming films from Firebase
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const filmsRef = collection(db, "films");
        // Query films where status is "upcoming" or "coming-soon"
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

  if (loading) {
    return (
      <section className="bg-zinc-100 dark:bg-zinc-900 py-12 md:py-16 transition-colors">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  if (upcomingFilms.length === 0) return null;

  // Get films for bento layout
  const [main, ...rest] = upcomingFilms;
  const secondary = rest.slice(0, 3);

  return (
    <section className="bg-zinc-100 dark:bg-zinc-900 py-12 md:py-16 transition-colors">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-8 flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold text-red-600 md:text-3xl">
            Coming Soon
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Main Featured Card - Large */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-red-800 md:col-span-2 md:row-span-2"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/20" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/20" />
            </div>

            <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
              {/* Top Badge */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                  🎬 Featured Premiere
                </span>
                <span className="flex items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 text-sm font-bold text-white">
                  <Calendar className="h-4 w-4" />
                  {getDaysUntil(main.releaseDate) > 0
                    ? `${getDaysUntil(main.releaseDate)} days`
                    : "Coming Soon"}
                </span>
              </div>

              {/* Content */}
              <div className="mt-auto space-y-4">
                {/* Genres */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {main.genre?.map((g) => (
                    <span
                      key={g}
                      className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-3xl font-black text-white md:text-5xl lg:text-6xl">
                  {main.title}
                </h3>

                {/* Description */}
                <p className="max-w-xl text-base text-white/80 md:text-lg">
                  {main.description}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(main.releaseDate)}
                  </span>
                  {main.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {main.duration} min
                    </span>
                  )}
                  {main.director && <span>Dir: {main.director}</span>}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Secondary Cards - Smaller Bento Boxes */}
          {secondary.map((film, index) => (
            <motion.div
              key={film.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl ${
                index === 0
                  ? "bg-gradient-to-br from-zinc-800 to-zinc-900"
                  : index === 1
                  ? "bg-gradient-to-br from-purple-900/50 to-zinc-900"
                  : "bg-gradient-to-br from-blue-900/50 to-zinc-900"
              }`}
            >
              {/* Thumbnail Background (if available) */}
              {film.thumbnailKey && (
                <div className="absolute inset-0 opacity-30">
                  <ThumbnailImage
                    thumbnailKey={film.thumbnailKey}
                    alt={film.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="relative flex h-full min-h-[200px] flex-col justify-between p-5">
                {/* Top */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-wrap gap-1">
                    {film.genre?.slice(0, 2).map((g) => (
                      <span
                        key={g}
                        className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <span className="rounded-full bg-red-600/80 px-2.5 py-1 text-xs font-bold text-white">
                    {getDaysUntil(film.releaseDate) > 0
                      ? `${getDaysUntil(film.releaseDate)}d`
                      : "Soon"}
                  </span>
                </div>

                {/* Bottom */}
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white md:text-xl">
                    {film.title}
                  </h4>
                  <p className="line-clamp-2 text-sm text-white/60">
                    {film.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-white/50">
                      <Calendar className="h-3 w-3" />
                      {formatDate(film.releaseDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 rounded-2xl ring-2 ring-red-500/50" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
