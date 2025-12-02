"use client";

import { useState } from "react";
import { useFilm } from "@/context/film-context";
import ThumbnailImage from "@/components/thumbnail-image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "./ui/input";

export default function FilmGrid() {
  const { films } = useFilm();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [search, setSearch] = useState(false);
  const [filmsFiltered, setFilmsFiltered] = useState(films);

  if (!films || films.length === 0) return null;

  return (
    <section className="relative bg-zinc-100 py-8 md:py-12">
      {/* Section Header */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <h2 className="text-xl font-bold text-zinc-900 md:text-2xl">
            All Films
          </h2>
          {!search && (
            <Search
              onClick={() => setSearch(true)}
              className="cursor-pointer"
            />
          )}
          {search && (
            <div className="ml-4">
              <Input
                type="text"
                onChange={(e) => {
                  const query = e.target.value.toLowerCase();
                  setFilmsFiltered(
                    films.filter((film) =>
                      film.title.toLowerCase().includes(query)
                    )
                  );
                }}
                placeholder="Search films..."
                className="rounded-md border border-gray-300 px-3 py-1"
                autoFocus
                onBlur={() => setSearch(false)}
              />
            </div>
          )}
        </div>
      </div>
      <div>
        {filmsFiltered.length === 0 && (
          <p className="text-center text-zinc-600">No films found.</p>
        )}
      </div>

      {/* Grid Container */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-2 gap-3 pt-24 sm:grid-cols-3 md:grid-cols-4 md:gap-4 md:pt-28 lg:grid-cols-5 lg:pt-32">
          {filmsFiltered.map((film, i) => {
            const isHovered = i === hoveredIndex;

            return (
              <div
                key={film.id ?? i}
                className="relative w-full"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Full red wrapper - only visible when hovered */}
                {isHovered && (
                  <div className="absolute -bottom-2 -left-3 -right-3 -top-24 bg-red-600 md:-bottom-3 md:-left-8 md:-right-8 md:-top-28 lg:-top-32" />
                )}

                <Link
                  href={`/film/${film.id}`}
                  className="relative block w-full overflow-hidden rounded-xl shadow-lg transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-2/3 overflow-hidden">
                    <ThumbnailImage
                      thumbnailKey={film.thumbnailKey}
                      alt={film.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Info Section */}
                  <div
                    className={`p-3 transition-colors duration-300 md:p-4 ${
                      isHovered
                        ? "bg-red-600 text-white"
                        : "bg-white text-zinc-900"
                    }`}
                  >
                    <p className="line-clamp-1 text-sm font-medium md:text-base">
                      {film.title}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
