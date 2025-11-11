"use client";

import { useFilm } from "@/context/film-context";
import ThumbnailImage from "@/components/thumbnail-image";
import { Play } from "lucide-react";

export default function FilmGrid() {
  const { films, handleSelect } = useFilm();

  return (
    <section className="bg-zinc-50 px-8 py-16">
      <h3 className="mb-6 text-3xl font-bold text-zinc-900">All Films</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {films.map((film) => (
          <button
            key={film.id}
            onClick={() => handleSelect(film)}
            className="group relative aspect-2/3 overflow-hidden rounded-lg bg-zinc-900 transition-transform hover:scale-105"
          >
            <ThumbnailImage
              thumbnailKey={film.thumbnailKey}
              alt={film.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Play className="h-8 w-8 fill-white text-white" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
