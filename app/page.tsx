"use client";

import FeaturedFilm from "@/components/featured-film";
import FilmGrid from "@/components/film-grid";
import VideoModal from "@/components/video-modal";
import UpcomingFilms from "@/components/upcoming-films";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}

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
