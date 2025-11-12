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

  // Loading placeholder
  if (loading) {
    return (
      <div
        className={`flex aspect-[2/3] items-center justify-center bg-zinc-800 text-zinc-400 ${className}`}
      >
        Loading...
      </div>
    );
  }

  // Fallback if no image
  if (!thumbnailUrl) {
    return (
      <div
        className={`flex aspect-[2/3] items-center justify-center bg-zinc-800 text-zinc-400 ${className}`}
      >
        {alt}
      </div>
    );
  }

  // Render portrait poster image
  return (
    <div className={`relative aspect-2/3 w-full overflow-hidden ${className}`}>
      <Image
        src={thumbnailUrl}
        alt={alt}
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 100vw, 400px"
      />
    </div>
  );
}
