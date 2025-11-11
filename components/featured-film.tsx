"use client";

import { useFilm } from "@/context/film-context";
import { Play } from "lucide-react";
import ThumbnailImage from "@/components/thumbnail-image";

export default function FeaturedFilm() {
  const { featuredFilm, handleSelect, loading } = useFilm();

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-white">Loading featured film...</p>
      </div>
    );

  if (!featuredFilm) return null;

  return (
    <section className="relative min-h-screen bg-white pt-24 text-center">
      <h2 className="text-7xl font-black text-red-600">
        {featuredFilm.title.toUpperCase()}
      </h2>

      <div className="mx-auto w-full max-w-2xl">
        <ThumbnailImage
          thumbnailKey={featuredFilm.thumbnailKey}
          alt={featuredFilm.title}
          className="w-full rounded-lg shadow-2xl"
        />
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-zinc-700">
        {featuredFilm.description}
      </p>

      <button
        onClick={() => handleSelect(featuredFilm)}
        className="mt-8 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-10 py-4 text-lg font-bold text-white transition hover:bg-red-700 mx-auto"
      >
        <Play className="h-6 w-6 fill-white" />
        PLAY NOW
      </button>
    </section>
  );
}
