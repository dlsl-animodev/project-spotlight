"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ThumbnailImageProps {
  thumbnailKey?: string;
  alt: string;
  className?: string;
}

export default function ThumbnailImage({
  thumbnailKey,
  alt,
  className = "",
}: ThumbnailImageProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThumbnail = async () => {
      if (!thumbnailKey) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/signed-url?key=${encodeURIComponent(thumbnailKey)}`
        );
        if (res.ok) {
          const data = await res.json();
          setThumbnailUrl(data.url);
        }
      } catch (err) {
        console.error("thumbnail fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchThumbnail();
  }, [thumbnailKey]);

  // Loading state
  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-800 text-zinc-400 ${className}`}
      >
        Loading...
      </div>
    );
  }

  // Fallback if no thumbnail
  if (!thumbnailUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-800 text-zinc-400 ${className}`}
      >
        {alt}
      </div>
    );
  }

  // Render image
  return (
    <Image
      src={thumbnailUrl}
      alt={alt}
      width={800}
      height={600}
      className={className}
      priority={true}
    />
  );
}
