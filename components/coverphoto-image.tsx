"use client";

import { useEffect, useState, useCallback, memo } from "react";
import Image from "next/image";

// Client-side URL cache (shared with thumbnail)
const urlCache = new Map<string, string>();

interface CoverPhotoImageProps {
  coverphotoKey?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

function CoverPhotoImage({
  coverphotoKey,
  alt,
  className = "",
  priority = false,
}: CoverPhotoImageProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(() => {
    if (coverphotoKey && urlCache.has(coverphotoKey)) {
      return urlCache.get(coverphotoKey)!;
    }
    return null;
  });
  const [loading, setLoading] = useState(!coverUrl);
  const [imageLoaded, setImageLoaded] = useState(false);

  const fetchCover = useCallback(async () => {
    if (!coverphotoKey) {
      setLoading(false);
      return;
    }

    if (urlCache.has(coverphotoKey)) {
      setCoverUrl(urlCache.get(coverphotoKey)!);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/signed-url?key=${encodeURIComponent(coverphotoKey)}`
      );
      if (res.ok) {
        const data = await res.json();
        urlCache.set(coverphotoKey, data.url);
        setCoverUrl(data.url);
      }
    } catch (err) {
      console.error("cover photo fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [coverphotoKey]);

  useEffect(() => {
    if (!coverUrl) {
      fetchCover();
    }
  }, [coverUrl, fetchCover]);

  // Skeleton loading placeholder
  if (loading) {
    return (
      <div
        className={`absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-200 to-zinc-300 ${className}`}
      />
    );
  }

  // Fallback if no image
  if (!coverUrl) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-400 ${className}`}
      >
        <span className="text-xs">{alt}</span>
      </div>
    );
  }

  // Render cover photo image with fade-in
  return (
    <>
      {!imageLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-200 to-zinc-300" />
      )}
      <Image
        src={coverUrl}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${className} ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        sizes="(max-width: 768px) 100vw, 50vw"
        onLoad={() => setImageLoaded(true)}
      />
    </>
  );
}

export default memo(CoverPhotoImage);
