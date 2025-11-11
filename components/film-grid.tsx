"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useFilm } from "@/context/film-context";
import ThumbnailImage from "@/components/thumbnail-image";
import VideoOverview from "./video-overview";
import { Film } from "@/type/film-type";

export default function FilmCarousel() {
  const { films, handleSelect } = useFilm();
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  // Scroll helpers
  const scrollByCard = useCallback((direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    // fallback width
    const cardWidth = card
      ? card.getBoundingClientRect().width
      : el.getBoundingClientRect().width * 0.8;
    const gap = 16; // matches gap in tailwind (gap-4)
    const distance = Math.round((cardWidth + gap) * (direction === 1 ? 1 : -1));
    el.scrollBy({ left: distance, behavior: "smooth" });
  }, []);

  // update visible index (approx)
  const updateIndexFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (!children.length) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    children.forEach((c, i) => {
      const rect = c.getBoundingClientRect();
      const left = c.offsetLeft;
      const mid = left + rect.width / 2;
      const dist = Math.abs(mid - center);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setIndex(closest);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateIndexFromScroll, { passive: true });
    updateIndexFromScroll();
    return () => el.removeEventListener("scroll", updateIndexFromScroll);
  }, [updateIndexFromScroll]);

  // keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") scrollByCard(1);
      if (e.key === "ArrowLeft") scrollByCard(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollByCard]);

  const openModal = (film: Film) => {
    setSelectedFilm(film);
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFilm(null), 220);
  }, []);

  const handlePlay = () => {
    if (!selectedFilm) return;
    handleSelect(selectedFilm);
    closeModal();
  };

  if (!films || films.length === 0) return null;

  return (
    <section className="relative bg-white py-10 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-zinc-900">
            Featured Collection
          </h2>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              aria-label="Previous"
              onClick={() => scrollByCard(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105"
            >
              <ChevronLeft className="h-5 w-5 text-zinc-700" />
            </button>
            <button
              aria-label="Next"
              onClick={() => scrollByCard(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105"
            >
              <ChevronRight className="h-5 w-5 text-zinc-700" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollerRef}
            className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth scroll-px-4 snap-x snap-mandatory py-3 px-1"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {films.map((film, i) => (
              <motion.button
                key={film.id ?? i}
                onClick={() => openModal(film)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative shrink-0 snap-start min-w-[40%] sm:min-w-[30%] md:min-w-[24%] lg:min-w-[18%] xl:min-w-[14%] rounded-2xl overflow-hidden shadow-xl"
                style={{
                  background: "#111",
                }}
                aria-label={`Open ${film.title} details`}
              >
                <div className="relative h-52 md:h-60 lg:h-72">
                  <ThumbnailImage
                    thumbnailKey={film.thumbnailKey}
                    alt={film.title}
                    className="h-full w-full object-cover"
                  />

                  {/* title overlay bottom-left */}
                  <div className="absolute bottom-3 left-3 z-10 w-[85%] rounded-md bg-linear-to-t from-black/75 via-black/40 to-transparent px-3 py-2 backdrop-blur-sm">
                    <p className="text-sm font-bold text-white line-clamp-2">
                      {film.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-300">
                      <span className="rounded bg-red-600 px-2 py-0.5 font-semibold text-white">
                        {film.rating || "NR"}
                      </span>
                      <span>{film.releaseDate?.split("-")?.[0]}</span>
                      {film.duration && <span>{film.duration}m</span>}
                    </div>
                  </div>

                  {/* center play button (semi-transparent) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-white/10 p-3 transition-opacity opacity-0 group-hover:opacity-100">
                      <Play className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>

                {/* subtle caption under image for Apple-like spacing */}
                <div className="p-3">
                  <p className="text-sm font-medium text-zinc-900 line-clamp-1">
                    {film.title}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* small pagination dots */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {films.slice(0, Math.min(10, films.length)).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const el = scrollerRef.current;
                  if (!el) return;
                  const child = el.children[i] as HTMLElement | null;
                  if (!child) return;
                  el.scrollTo({
                    left: child.offsetLeft - 8,
                    behavior: "smooth",
                  });
                }}
                className={`h-2 w-8 rounded-full transition-all ${
                  i === index ? "bg-zinc-900" : "bg-zinc-300"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* floating arrows for small screens */}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              onClick={() => scrollByCard(-1)}
              className="pointer-events-auto ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md"
              aria-label="Prev"
            >
              <ChevronLeft className="h-5 w-5 text-zinc-700" />
            </button>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center sm:hidden">
            <button
              onClick={() => scrollByCard(1)}
              className="pointer-events-auto mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5 text-zinc-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <VideoOverview
        film={selectedFilm}
        isOpen={isModalOpen}
        onClose={closeModal}
        onPlay={handlePlay}
      />
    </section>
  );
}
