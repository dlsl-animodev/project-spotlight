"use client";

import { useFilm } from "@/context/film-context";
import { useState, useCallback, useEffect } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function VideoModal() {
  const { videoUrl, selectedFilm, closeVideo } = useFilm();
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(videoUrl);
  const [isLoading, setIsLoading] = useState(false);

  // Sync currentSrc with videoUrl when it changes (fixes stale URL bug)
  useEffect(() => {
    if (videoUrl) {
      setCurrentSrc(videoUrl);
      setHasError(false); // Reset error state for new video
    }
  }, [videoUrl]);

  // Refresh signed URL on error
  const handleRetry = useCallback(async () => {
    if (!selectedFilm?.key) return;

    setIsLoading(true);
    setHasError(false);

    try {
      const res = await fetch(
        `/api/signed-url?key=${encodeURIComponent(selectedFilm.key)}`
      );
      if (res.ok) {
        const data = await res.json();
        setCurrentSrc(data.url);
      }
    } catch (err) {
      console.error("Failed to refresh URL:", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilm?.key]);

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

        {hasError ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <p className="text-lg text-white">Failed to load video</p>
            <button
              onClick={handleRetry}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Retrying..." : "Try Again"}
            </button>
          </div>
        ) : (
          <video
            key={currentSrc || videoUrl}
            controls
            autoPlay
            className="w-full rounded-lg"
            src={currentSrc || videoUrl}
            onError={() => setHasError(true)}
            onLoadedData={() => setHasError(false)}
          />
        )}
      </div>
    </div>
  );
}
