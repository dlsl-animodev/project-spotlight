"use client";

import { useFilm } from "@/context/film-context";

export default function VideoModal() {
  const { videoUrl, closeVideo } = useFilm();

  if (!videoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
      <div className="relative w-full max-w-6xl">
        <button
          onClick={closeVideo}
          className="absolute -top-12 right-0 text-3xl text-white hover:text-red-600"
        >
          ✕
        </button>
        <video
          key={videoUrl}
          controls
          autoPlay
          className="w-full rounded-lg"
          src={videoUrl}
        />
      </div>
    </div>
  );
}
