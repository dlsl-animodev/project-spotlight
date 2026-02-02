"use client";

import { useFilm } from "@/context/film-context";
import { Play } from "lucide-react";
import ThumbnailImage from "@/components/thumbnail-image";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

// URL cache for background
const bgCache = new Map<string, string>();

export default function FeaturedFilm() {
  const { featuredFilm, loading } = useFilm();
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchBackground = useCallback(async () => {
    if (!featuredFilm?.coverphotoKey) return;

    // Check cache
    if (bgCache.has(featuredFilm.coverphotoKey)) {
      setBackgroundUrl(bgCache.get(featuredFilm.coverphotoKey)!);
      return;
    }

    try {
      const res = await fetch(
        `/api/signed-url?key=${encodeURIComponent(featuredFilm.coverphotoKey)}`,
      );
      if (res.ok) {
        const data = await res.json();
        bgCache.set(featuredFilm.coverphotoKey, data.url);
        setBackgroundUrl(data.url);
      }
    } catch (err) {
      console.error("background fetch error", err);
    }
  }, [featuredFilm?.coverphotoKey]);

  useEffect(() => {
    fetchBackground();
  }, [fetchBackground]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-white">Loading featured film...</p>
      </div>
    );

  if (!featuredFilm) return null;

  const formattedReleaseDate = featuredFilm.releaseDate.includes("T")
    ? featuredFilm.releaseDate.split("T")[0]
    : featuredFilm.releaseDate;

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center overflow-hidden px-4 pt-24 pb-12 text-center md:pt-28 lg:pt-32">
      {/* Background Image with Overlay - using Next.js Image for optimization */}
      {backgroundUrl && (
        <div className="absolute inset-0">
          {/* Skeleton while loading */}
          {!bgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-100 to-zinc-200" />
          )}
          <Image
            src={backgroundUrl}
            alt="Background"
            fill
            priority
            className={`object-cover transition-opacity duration-500 ${
              bgLoaded ? "opacity-100" : "opacity-0"
            }`}
            sizes="100vw"
            onLoad={() => setBgLoaded(true)}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-white/85 backdrop-blur-sm" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl space-y-6">
        {/* Title - Smaller and below navbar */}
        <h2 className="line-clamp-2 text-xl font-black text-red-600 sm:text-2xl md:text-3xl lg:text-4xl">
          {featuredFilm.title}
        </h2>

        {/* 2-Column Grid */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
          {/* Left: Thumbnail */}
          <div className="mx-auto aspect-[2/3] w-48 sm:w-56 md:w-full lg:max-w-sm">
            <ThumbnailImage
              thumbnailKey={featuredFilm.thumbnailKey}
              alt={featuredFilm.title}
              className="h-full w-full rounded-xl object-cover shadow-2xl"
              priority
            />
          </div>

          {/* Right: Metadata */}
          <div className="flex flex-col justify-center space-y-3 text-center md:space-y-4 md:text-left">
            {/* Rating/Year/Duration/Genre */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-700 sm:text-sm md:justify-start md:gap-4">
              <span className="rounded bg-red-600 px-2 py-1 font-semibold text-white sm:px-3">
                {featuredFilm.rating || "NR"}
              </span>
              <span>{formattedReleaseDate}</span>
              {featuredFilm.duration && (
                <span>{featuredFilm.duration} min</span>
              )}
            </div>

            {featuredFilm.genre && (
              <p className="text-xs text-zinc-700 sm:text-sm">
                <span className="font-semibold">Genre: </span>
                {featuredFilm.genre.join(", ")}
              </p>
            )}

            {/* Description */}
            <div>
              <p
                className={`text-sm leading-relaxed text-black sm:text-base md:text-lg ${
                  expanded ? "" : "line-clamp-4"
                }`}
              >
                {featuredFilm.description}
              </p>
              {featuredFilm.description &&
                featuredFilm.description.length > 200 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
                  >
                    {expanded ? "Show less" : "Read more"}
                  </button>
                )}
            </div>

            {/* Actors / Director */}
            <div className="space-y-1 text-zinc-800">
              {featuredFilm.actors?.length > 0 && (
                <p className="text-xs sm:text-sm">
                  <span className="font-semibold">Starring: </span>
                  {featuredFilm.actors.join(", ")}
                </p>
              )}
              {featuredFilm.director && (
                <p className="text-xs sm:text-sm">
                  <span className="font-semibold">Director: </span>
                  {featuredFilm.director}
                </p>
              )}
            </div>

            {/* Play Button */}
            <div className="flex justify-center md:justify-start">
              <Link
                href={`/film/${featuredFilm.id}`}
                className="flex w-fit items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 sm:px-8 sm:py-3 sm:text-base"
              >
                <Play className="h-4 w-4 fill-white sm:h-5 sm:w-5" />
                PLAY NOW
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
