"use client";

import { useFilm } from "@/context/film-context";
import ThumbnailImage from "@/components/thumbnail-image";
import { Play } from "lucide-react";
import VideoOverview from "./video-overview";
import { useCallback, useEffect, useState } from "react";
import { Film } from "@/type/film-type";

export default function FilmGrid() {
  const { films, handleSelect } = useFilm();
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFilmClick = (film: Film) => {
    setSelectedFilm(film);
    setIsModalOpen(true);
  };

  const handlePlay = () => {
    if (selectedFilm) {
      handleSelect(selectedFilm);
      closeModal();
    }
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFilm(null), 200);
  }, []);

  // prevent background scroll
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Esc key closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    if (isModalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, closeModal]);

  return (
    <>
      <section className="bg-zinc-50 px-8 py-16">
        <h3 className="mb-6 text-3xl font-bold text-zinc-900">All Films</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {films.map((film) => (
            <button
              key={film.id}
              onClick={() => handleFilmClick(film)}
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

      {/* Show VideoOverview modal when a film is selected */}
      <VideoOverview
        film={selectedFilm}
        onPlay={handlePlay}
        onClose={closeModal}
        isOpen={isModalOpen}
      />
    </>
  );
}
