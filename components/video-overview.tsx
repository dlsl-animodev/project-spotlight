"use client";
import React, { useEffect } from "react";
import { Play, X } from "lucide-react";
import ThumbnailImage from "@/components/thumbnail-image";
import { Film } from "@/type/film-type";
import { motion, AnimatePresence } from "framer-motion";

export default function VideoOverview({
  film,
  isOpen,
  onClose,
  onPlay,
}: {
  film: Film | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
}) {
  if (!film) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
          aria-label={`${film.title} details`}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Card */}
          <motion.div
            className="relative z-10 w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex flex-col gap-6 p-6 md:flex-row lg:gap-8 lg:p-10">
              {/* Left: Thumbnail */}
              <div className="md:flex-1">
                <div className="relative overflow-hidden rounded-lg">
                  <ThumbnailImage
                    thumbnailKey={film.coverphotoKey}
                    alt={film.title}
                    className="h-64 w-full object-cover md:h-[460px] lg:h-[520px]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/80 via-white/50 to-transparent" />
                </div>
              </div>

              {/* Right: Details */}
              <div className="md:flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-extrabold text-red-600 lg:text-3xl">
                      {film.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-700 lg:text-base">
                      <span className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                        {film.rating || "NR"}
                      </span>
                      <span>{film.releaseDate?.split?.("-")?.[0]}</span>
                      {film.duration && <span>{film.duration} min</span>}
                      {film.genre && <span>{film.genre.join(", ")}</span>}
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm transition hover:bg-zinc-50"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5 text-zinc-700" />
                  </button>
                </div>

                <div className="mt-4 max-h-72 overflow-auto pr-2 text-zinc-700 lg:max-h-96">
                  <p className="text-sm leading-relaxed lg:text-base">
                    {film.description}
                  </p>

                  {film.actors?.length > 0 && (
                    <p className="mt-4 text-sm lg:text-base">
                      <span className="font-semibold text-zinc-800">
                        Starring:{" "}
                      </span>
                      <span className="text-zinc-600">
                        {film.actors.join(", ")}
                      </span>
                    </p>
                  )}

                  {film.director && (
                    <p className="mt-2 text-sm lg:text-base">
                      <span className="font-semibold text-zinc-800">
                        Director:{" "}
                      </span>
                      <span className="text-zinc-600">{film.director}</span>
                    </p>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      onPlay();
                      onClose();
                    }}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 lg:text-base"
                  >
                    <Play className="h-5 w-5" />
                    Play
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
