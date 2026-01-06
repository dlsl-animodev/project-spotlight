"use client";

import { useState } from "react";
import { useFilm } from "@/context/film-context";
import ThumbnailImage from "@/components/thumbnail-image";
import Link from "next/link";
import { Input } from "./ui/input";

export default function FilmGrid() {
  const { films } = useFilm();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [search, setSearch] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const releasedFilms = films.filter(
    (film) => !film.status || film.status === "released"
  );

  const filmsFiltered = searchQuery
    ? films.filter((film) => {
        const q = searchQuery.toLowerCase();

        return (
          film.title.toLowerCase().includes(q) ||
          film.genre?.some((g) => g.toLowerCase().includes(q))
        );
      })
    : releasedFilms;

  if (!films || films.length === 0) return null;

  return (
    <section className="relative bg-zinc-100 py-8 md:py-12">
      {/* Section Header */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl">
              More from{" "}
              <span className="text-white bg-red-600">Film Society</span>
            </h2>
            {/* {!search && (
              <button
                onClick={() => setSearch(true)}
                className="rounded-full p-2 transition-colors hover:bg-zinc-200"
                aria-label="Search films"
              >
                <Search className="h-5 w-5 text-zinc-600 md:h-6 md:w-6" />
              </button>
            )} */}
          </div>

          {search && (
            <div className="mx-auto mt-6 flex max-w-xl items-center justify-center gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search films or genres..."
                  className="h-11 w-full rounded-full border-zinc-300 bg-white px-5 text-base shadow-sm transition-shadow focus:border-zinc-400 focus:shadow-md focus:outline-none focus:ring-0"
                  autoFocus
                />
              </div>
              {/* <button
                onClick={() => {
                  setSearch(false);
                  setSearchQuery("");
                }}
                className="rounded-full p-2.5 transition-colors hover:bg-zinc-200"
                aria-label="Close search"
              >
                <X className="h-5 w-5 text-zinc-600" />
              </button> */}
            </div>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-2 gap-3 pt-20 sm:grid-cols-3 md:grid-cols-4 md:gap-4 md:pt-22 lg:grid-cols-5 lg:pt-24">
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
                      priority={i < 5}
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
                    <p
                      className={`line-clamp-1 text-xs md:text-sm ${
                        isHovered ? "text-white/80" : "text-zinc-500"
                      }`}
                    >
                      {film.genre && film.genre.length > 0
                        ? film.genre
                            .map((g) => g.charAt(0).toUpperCase() + g.slice(1))
                            .join(" • ")
                        : ""}
                    </p>
                    <p className="line-clamp-1 text-sm font-semibold md:text-base">
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
