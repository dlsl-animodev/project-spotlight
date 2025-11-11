"use client";

import UploadFilm from "@/components/upload-film";
import FeaturedFilm from "@/components/featured-film";
import FilmGrid from "@/components/film-grid";
import VideoModal from "@/components/video-modal";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-white px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-red-600">SPOTLIGHT</h1>
          <UploadFilm />
        </div>
      </header>

      {/* Sections */}
      <main className="pt-24">
        <FeaturedFilm />
        <FilmGrid />
        <VideoModal />
      </main>
    </div>
  );
}
