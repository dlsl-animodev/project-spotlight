"use client";

import { useEffect, useState, useCallback, memo } from "react";
import Image from "next/image";

// Client-side URL cache
const urlCache = new Map<string, string>();

interface ThumbnailImageProps {
  thumbnailKey?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

function ThumbnailImage({
  thumbnailKey,
  alt,
  className = "",
  priority = false,
}: ThumbnailImageProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(() => {
    // Check cache on initial render
    if (thumbnailKey && urlCache.has(thumbnailKey)) {
      return urlCache.get(thumbnailKey)!;
    }
    return null;
  });
  const [loading, setLoading] = useState(!thumbnailUrl);
  const [imageLoaded, setImageLoaded] = useState(false);

  const fetchThumbnail = useCallback(async () => {
    if (!thumbnailKey) {
      setLoading(false);
      return;
    }

    // Check cache first
    if (urlCache.has(thumbnailKey)) {
      setThumbnailUrl(urlCache.get(thumbnailKey)!);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/signed-url?key=${encodeURIComponent(thumbnailKey)}`
      );
      if (res.ok) {
        const data = await res.json();
        urlCache.set(thumbnailKey, data.url);
        setThumbnailUrl(data.url);
      }
    } catch (err) {
      console.error("thumbnail fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [thumbnailKey]);

  useEffect(() => {
    if (!thumbnailUrl) {
      fetchThumbnail();
    }
  }, [thumbnailUrl, fetchThumbnail]);

  // Skeleton loading placeholder
  if (loading) {
    return (
      <div
        className={`aspect-[2/3] animate-pulse bg-gradient-to-br from-zinc-200 to-zinc-300 ${className}`}
      />
    );
  }

  // Fallback if no image
  if (!thumbnailUrl) {
    return (
      <div
        className={`flex aspect-[2/3] items-center justify-center bg-zinc-800 text-zinc-400 ${className}`}
      >
        <span className="text-xs text-center px-2">{alt}</span>
      </div>
    );
  }

  // Render portrait poster image with blur-up effect
  return (
    <div className={`relative aspect-2/3 w-full overflow-hidden ${className}`}>
      {/* Skeleton shown until image loads */}
      {!imageLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-200 to-zinc-300" />
      )}
      <Image
        src={thumbnailUrl}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
}

export default memo(ThumbnailImage);
