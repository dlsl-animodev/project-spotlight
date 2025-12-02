"use client";

import { useFilm } from "@/context/film-context";
import { Play } from "lucide-react";
import ThumbnailImage from "@/components/thumbnail-image";
import { useEffect, useState } from "react";

export default function FeaturedFilm() {
  const { featuredFilm, handleSelect, loading } = useFilm();
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchBackground = async () => {
      if (!featuredFilm?.coverphotoKey) return;

      try {
        const res = await fetch(
          `/api/signed-url?key=${encodeURIComponent(
            featuredFilm.coverphotoKey
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          setBackgroundUrl(data.url);
        }
      } catch (err) {
        console.error("background fetch error", err);
      }
    };

    fetchBackground();
  }, [featuredFilm?.coverphotoKey]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-white">Loading featured film...</p>
      </div>
    );

  if (!featuredFilm) return null;

  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Background Image with Overlay */}
      {backgroundUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        >
          <div className="absolute inset-0 bg-white/85 backdrop-blur-sm" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl space-y-6">
        {/* Title - Same position */}
        <h2 className="text-7xl font-black text-red-600 md:text-7xl lg:text-8xl">
          {featuredFilm.title.toUpperCase()}
        </h2>

        {/* 2-Column Grid */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          {/* Left: Thumbnail */}
          <div className="mx-auto aspect-2/3 w-64 md:w-full lg:max-w-sm">
            <ThumbnailImage
              thumbnailKey={featuredFilm.thumbnailKey}
              alt={featuredFilm.title}
              className="h-full w-full rounded-xl object-cover shadow-2xl"
            />
          </div>

          {/* Right: Metadata */}
          <div className="flex flex-col justify-center space-y-4  text-left">
            {/* Rating/Year/Duration/Genre */}
            <div className="flex flex-wrap items-center gap-18 text-sm text-zinc-700 ">
              <span className="rounded bg-red-600 px-3 py-1 font-semibold text-white">
                {featuredFilm.rating || "NR"}
              </span>
              <span>{featuredFilm.releaseDate}</span>
              {featuredFilm.duration && (
                <span>{featuredFilm.duration} min</span>
              )}
            </div>

            {featuredFilm.genre && (
              <p className="text-sm text-zinc-700">
                <span className="font-semibold">Genre: </span>
                {featuredFilm.genre.join(", ")}
              </p>
            )}

            {/* Description */}
            <p className="text-base leading-relaxed text-black md:text-lg">
              {featuredFilm.description}
            </p>

            {/* Actors / Director */}
            <div className="space-y-1 text-zinc-800">
              {featuredFilm.actors?.length > 0 && (
                <p className="text-sm">
                  <span className="font-semibold">Starring: </span>
                  {featuredFilm.actors.join(", ")}
                </p>
              )}
              {featuredFilm.director && (
                <p className="text-sm">
                  <span className="font-semibold">Director: </span>
                  {featuredFilm.director}
                </p>
              )}
            </div>

            {/* Play Button */}
            <button
              onClick={() => handleSelect(featuredFilm)}
              className="flex w-fit items-center gap-2 rounded-lg bg-red-600 px-8 py-3 text-base font-bold text-white transition hover:bg-red-700"
            >
              <Play className="h-5 w-5 fill-white" />
              PLAY NOW
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
