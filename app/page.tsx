"use client";

import FeaturedFilm from "@/components/featured-film";
import FilmGrid from "@/components/film-grid";
import VideoModal from "@/components/video-modal";
import UpcomingFilms from "@/components/upcoming-films";
import { Search } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-6">
          <div className="flex items-center gap-2"></div>

          {/* Center: Logo */}
          <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-black tracking-tight text-red-600 md:text-3xl">
            SPOTLIGHT
          </h1>

          {/* Right: Search */}
          <button
            className="rounded-full p-2 text-zinc-600 transition hover:bg-zinc-100"
            aria-label="Search"
          ></button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <FeaturedFilm />
        <FilmGrid />
        <UpcomingFilms />
        <VideoModal />
      </main>
    </div>
  );
}
