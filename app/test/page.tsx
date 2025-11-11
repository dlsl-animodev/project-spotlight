"use client";

import { useEffect, useRef, useState } from "react";
import { useFilm } from "@/context/film-context";
import { Play, X } from "lucide-react";
import ThumbnailImage from "@/components/thumbnail-image";

interface Film {
  id?: string;
  title: string;
  thumbnailKey?: string;
  description?: string;
  rating?: string;
  releaseDate?: string;
  duration?: number;
  genre?: string[];
  actors?: string[];
  director?: string;
  videoUrl?: string;
}

export default function FeaturedFilm(): JSX.Element | null {
  const { featuredFilm, handleSelect, loading } = useFilm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    // prevent background scroll when modal is open
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsModalOpen(false);
    }
    if (isModalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-white">Loading featured film...</p>
      </div>
    );

  if (!featuredFilm) return null;

  const film = featuredFilm as Film;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const onPlay = () => {
    // delegate to existing play handler (keeps your current player logic)
    handleSelect(featuredFilm);
    closeModal();
  };

  return (
    <>
      <section className="relative flex h-screen w-full flex-col items-center justify-center bg-white px-6 text-center">
        <div className="max-w-4xl space-y-6">
          <h2
            className="cursor-pointer text-5xl font-black text-red-600 md:text-6xl lg:text-7xl"
            onClick={openModal}
            aria-label={`Open details for ${film.title}`}
          >
            {film.title.toUpperCase()}
          </h2>

          <div
            className="mx-auto max-w-xl cursor-pointer overflow-hidden rounded-xl shadow-lg transition-transform duration-200 hover:scale-[1.01]"
            onClick={openModal}
            role="button"
            aria-label={`Open details for ${film.title}`}
          >
            <ThumbnailImage
              thumbnailKey={film.thumbnailKey}
              alt={film.title}
              className="w-full object-cover"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-700">
            <span className="rounded bg-red-600 px-3 py-1 font-semibold text-white">
              {film.rating || "NR"}
            </span>
            <span>{film.releaseDate?.split?.("-")?.[0]}</span>
            {film.duration && <span>{film.duration} min</span>}
            {film.genre && <span>{film.genre.join(", ")}</span>}
          </div>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-700 md:text-lg line-clamp-3">
            {film.description}
          </p>

          <div className="space-y-1 text-zinc-800">
            {film.actors?.length > 0 && (
              <p className="text-sm">
                <span className="font-semibold">Starring: </span>
                {film.actors.join(", ")}
              </p>
            )}
            {film.director && (
              <p className="text-sm">
                <span className="font-semibold">Director: </span>
                {film.director}
              </p>
            )}
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={openModal}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-8 py-3 text-base font-bold text-white transition hover:bg-red-700"
            >
              <Play className="h-5 w-5 fill-white" />
              PLAY NOW
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
          aria-label={`${film.title} details`}
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />

          {/* modal card */}
          <div className="relative z-10 mx-4 w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300">
            <div className="flex flex-col gap-6 p-6 md:flex-row">
              {/* Left: large thumbnail */}
              <div className="md:flex-1">
                <div className="relative overflow-hidden rounded-lg">
                  <ThumbnailImage
                    thumbnailKey={film.thumbnailKey}
                    alt={film.title}
                    className="h-64 w-full object-cover md:h-[420px]"
                  />

                  {/* subtle overlay gradient for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Right: details + controls */}
              <div className="md:flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-extrabold text-red-600">
                      {film.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-700">
                      <span className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                        {film.rating || "NR"}
                      </span>
                      <span>{film.releaseDate?.split?.("-")?.[0]}</span>
                      {film.duration && <span>{film.duration} min</span>}
                      {film.genre && <span>{film.genre.join(", ")}</span>}
                    </div>
                  </div>

                  <button
                    ref={closeBtnRef}
                    onClick={closeModal}
                    className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm transition hover:bg-zinc-50"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4 text-zinc-700" />
                  </button>
                </div>

                <div className="mt-4 max-h-[240px] overflow-auto pr-2 text-zinc-700">
                  <p className="text-sm leading-relaxed">{film.description}</p>

                  {film.actors?.length > 0 && (
                    <p className="mt-4 text-sm">
                      <span className="font-semibold text-zinc-800">
                        Starring:{" "}
                      </span>
                      <span className="text-zinc-600">
                        {film.actors.join(", ")}
                      </span>
                    </p>
                  )}

                  {film.director && (
                    <p className="mt-2 text-sm">
                      <span className="font-semibold text-zinc-800">
                        Director:{" "}
                      </span>
                      <span className="text-zinc-600">{film.director}</span>
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={onPlay}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    <Play className="h-4 w-4" />
                    Play
                  </button>

                  <button
                    onClick={() => {
                      /* example: add to watchlist behavior placeholder */
                    }}
                    className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    + My List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
