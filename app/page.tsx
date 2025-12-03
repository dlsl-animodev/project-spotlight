"use client";

import FeaturedFilm from "@/components/featured-film";
import FilmGrid from "@/components/film-grid";
import VideoModal from "@/components/video-modal";
import UpcomingFilms from "@/components/upcoming-films";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-6">
          {/* Mobile: Logo left */}
          <h1 className="text-2xl font-black tracking-tight text-red-600 md:hidden">
            SPOTLIGHT
          </h1>

          {/* Desktop: Center logo */}
          <h1 className="hidden md:block absolute left-1/2 -translate-x-1/2 text-2xl font-black tracking-tight text-red-600 md:text-3xl">
            SPOTLIGHT
          </h1>

          {/* Right: Nav Links */}
          <nav className="flex items-center gap-4 text-sm font-medium ml-auto">
            <Link
              href="/upcoming"
              className="text-zinc-600 hover:text-red-600 transition"
            >
              Upcoming
            </Link>
            <Link
              href="/about"
              className="text-zinc-600 hover:text-red-600 transition"
            >
              About
            </Link>
          </nav>
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
