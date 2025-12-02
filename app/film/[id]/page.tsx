"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/libs/firebase";
import { Film } from "@/type/film-type";
import {
  Play,
  ArrowLeft,
  Clock,
  Calendar,
  Star,
  Users,
  Clapperboard,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function FilmDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [film, setFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch film data
  useEffect(() => {
    const fetchFilm = async () => {
      if (!params.id) return;

      try {
        const filmDoc = await getDoc(doc(db, "films", params.id as string));
        if (filmDoc.exists()) {
          setFilm({ ...filmDoc.data(), id: filmDoc.id } as Film);
        }
      } catch (error) {
        console.error("Error fetching film:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilm();
  }, [params.id]);

  // Fetch signed URLs for images and video
  useEffect(() => {
    const fetchUrls = async () => {
      if (!film) return;

      try {
        // Fetch cover photo URL
        if (film.coverphotoKey) {
          const coverRes = await fetch(
            `/api/signed-url?key=${encodeURIComponent(film.coverphotoKey)}`
          );
          if (coverRes.ok) {
            const data = await coverRes.json();
            setCoverUrl(data.url);
          }
        }

        // Fetch thumbnail URL
        if (film.thumbnailKey) {
          const thumbRes = await fetch(
            `/api/signed-url?key=${encodeURIComponent(film.thumbnailKey)}`
          );
          if (thumbRes.ok) {
            const data = await thumbRes.json();
            setThumbnailUrl(data.url);
          }
        }

        // Fetch video URL
        if (film.key) {
          const videoRes = await fetch(
            `/api/signed-url?key=${encodeURIComponent(film.key)}`
          );
          if (videoRes.ok) {
            const data = await videoRes.json();
            setVideoUrl(data.url);
          }
        }
      } catch (error) {
        console.error("Error fetching URLs:", error);
      }
    };

    fetchUrls();
  }, [film]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!film) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 text-white">
        <h1 className="text-2xl font-bold">Film not found</h1>
        <button
          onClick={() => router.push("/")}
          className="mt-4 rounded-lg bg-red-600 px-6 py-3 font-medium hover:bg-red-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Video Player - Full screen when playing */}
      {isPlaying && videoUrl ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black"
        >
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <video
            src={videoUrl}
            controls
            autoPlay
            className="h-full w-full object-contain"
          />
        </motion.div>
      ) : (
        <>
          {/* Hero Section with Cover Photo */}
          <div className="relative h-[70vh] w-full overflow-hidden">
            {/* Cover Image */}
            {coverUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${coverUrl})` }}
              />
            )}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/80 via-transparent to-zinc-900/40" />

            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.push("/")}
              className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-sm transition hover:bg-white/20 md:left-8 md:top-8"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back</span>
            </motion.button>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-12">
              <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:gap-8">
                {/* Thumbnail Poster */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="hidden shrink-0 md:block"
                >
                  {thumbnailUrl && (
                    <div className="relative overflow-hidden rounded-xl shadow-2xl ring-4 ring-white/20">
                      <Image
                        src={thumbnailUrl}
                        alt={film.title}
                        className="h-[280px] w-[190px] object-cover lg:h-[340px] lg:w-[230px]"
                      />
                    </div>
                  )}
                </motion.div>

                {/* Title & Meta */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1"
                >
                  {/* Genre Tags */}
                  {film.genre && film.genre.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {film.genre.map((g) => (
                        <span
                          key={g}
                          className="rounded-full bg-red-600/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="text-3xl font-black text-white md:text-5xl lg:text-6xl">
                    {film.title}
                  </h1>

                  {/* Meta Info */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-300 md:text-base">
                    {film.rating && (
                      <span className="flex items-center gap-1.5 rounded bg-red-600 px-2 py-1 font-bold text-white">
                        <Star className="h-4 w-4" />
                        {film.rating}
                      </span>
                    )}
                    {film.releaseDate && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-red-500" />
                        {film.releaseDate.split("-")[0]}
                      </span>
                    )}
                    {film.duration && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-red-500" />
                        {film.duration} min
                      </span>
                    )}
                  </div>

                  {/* Play Button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => setIsPlaying(true)}
                    className="mt-6 flex items-center gap-3 rounded-xl bg-red-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700 hover:shadow-red-600/50"
                  >
                    <Play className="h-6 w-6 fill-white" />
                    Play Now
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
                <h2 className="mb-4 text-xl font-bold text-white md:text-2xl">
                  Synopsis
                </h2>
                <p className="text-base leading-relaxed text-zinc-400 md:text-lg">
                  {film.description}
                </p>
              </motion.div>

              {/* Cast & Crew */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {/* Director */}
                {film.director && (
                  <div className="rounded-xl bg-zinc-800/50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-400">
                      <Clapperboard className="h-4 w-4 text-red-500" />
                      Director
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {film.director}
                    </p>
                  </div>
                )}

                {/* Cast */}
                {film.actors && film.actors.length > 0 && (
                  <div className="rounded-xl bg-zinc-800/50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-400">
                      <Users className="h-4 w-4 text-red-500" />
                      Cast
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {film.actors.map((actor) => (
                        <span
                          key={actor}
                          className="rounded-lg bg-zinc-700/50 px-3 py-1.5 text-sm text-zinc-200"
                        >
                          {actor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile Thumbnail */}
                {thumbnailUrl && (
                  <div className="md:hidden">
                    <Image
                      src={thumbnailUrl}
                      alt={film.title}
                      className="w-full rounded-xl shadow-lg"
                    />
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
