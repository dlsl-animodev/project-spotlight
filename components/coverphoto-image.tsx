"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface CoverPhotoImageProps {
  coverphotoKey?: string;
  alt: string;
  className?: string;
}

export default function CoverPhotoImage({
  coverphotoKey,
  alt,
  className = "",
}: CoverPhotoImageProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCover = async () => {
      if (!coverphotoKey) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/signed-url?key=${encodeURIComponent(coverphotoKey)}`
        );
        if (res.ok) {
          const data = await res.json();
          setCoverUrl(data.url);
        }
      } catch (err) {
        console.error("cover photo fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCover();
  }, [coverphotoKey]);

  // Loading placeholder
  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-800 text-zinc-400 ${className}`}
      >
        Loading...
      </div>
    );
  }

  // Fallback if no image
  if (!coverUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-800 text-zinc-400 ${className}`}
      >
        {alt}
      </div>
    );
  }

  // Render cover photo image
  return (
    <Image
      src={coverUrl}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      priority
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}
