"use client";

import { useFilm } from "@/context/film-context";
import { Play } from "lucide-react";
import ThumbnailImage from "@/components/thumbnail-image";

export default function FeaturedFilm() {
  const { featuredFilm, handleSelect, loading } = useFilm();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-white">Loading featured film...</p>
      </div>
    );

  if (!featuredFilm) return null;

  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center bg-white/80 px-4 text-center backdrop-blur-sm">
      <div className="max-w-4xl space-y-6">
        {/* Title */}
        <h2 className="text-7xl font-black text-red-600 md:text-7xl lg:text-8xl">
          {featuredFilm.title.toUpperCase()}
        </h2>

        {/* Thumbnail (poster size, smaller) */}
        <div className="mx-auto aspect-2/3 w-48 md:w-56 lg:w-64">
          <ThumbnailImage
            thumbnailKey={featuredFilm.thumbnailKey}
            alt={featuredFilm.title}
            className="h-full w-full rounded-xl object-cover shadow-lg"
          />
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-700">
          <span className="rounded bg-red-600 px-3 py-1 font-semibold text-white">
            {featuredFilm.rating || "NR"}
          </span>
          <span>{featuredFilm.releaseDate?.split("-")[0]}</span>
          {featuredFilm.duration && <span>{featuredFilm.duration} min</span>}
          {featuredFilm.genre && <span>{featuredFilm.genre.join(", ")}</span>}
        </div>

        {/* Description */}
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-700 md:text-lg">
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
          className="mx-auto flex items-center gap-2 rounded-lg bg-red-600 px-8 py-3 text-base font-bold text-white transition hover:bg-red-700"
        >
          <Play className="h-5 w-5 fill-white" />
          PLAY NOW
        </button>
      </div>
    </section>
  );
}
