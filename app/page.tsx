"use client";

import { db } from "@/libs/firebase";
import { useEffect, useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { filmsRef } from "@/libs/collections";
import UploadFilm from "@/components/upload-film";

export const filmSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

export type FormFilmData = z.infer<typeof filmSchema>;

type VideoItem = {
  key: string;
  size: number;
  lastModified: string | null;
};

export default function Home() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoList, setVideoList] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFilmData>({
    resolver: zodResolver(filmSchema),
  });

  useEffect(() => {
    const fetchVideosFromFirestore = async () => {
      try {
        const response = await getDocs(collection(db, "films"));
        setVideoList(response.docs.map((doc) => doc.data()));
      } catch (error) {
        console.error("Error fetching videos from Firestore:", error);
      }
    };
    fetchVideosFromFirestore();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/videos", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`list request failed (${res.status})`);
        }
        const data = await res.json();
        setVideos(data.items ?? []);
      } catch (err) {
        console.error("videos fetch error", err);
        setError("Failed to load video list.");
      } finally {
        setListLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleSelect = async (key: string) => {
    setSelectedKey(key);
    setVideoLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/signed-url?key=${encodeURIComponent(key)}`);
      if (!res.ok) {
        throw new Error(`signed url request failed (${res.status})`);
      }
      const data = await res.json();
      setVideoUrl(data.url ?? null);
    } catch (err) {
      console.error("signed url fetch error", err);
      setVideoUrl(null);
      setError("Failed to load selected video.");
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col gap-8 bg-zinc-50 p-8 font-sans dark:bg-black">
      <header className="mx-auto max-w-5xl text-center">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
          Film Society
        </h1>
      </header>
      <UploadFilm />

      <div>
        Firestore videos:
        <ul>
          {videoList.map((video, index) => (
            <div key={index}>
              <li key={index}>{video.title}</li>
              <li key={index}>{video.description}</li>
            </div>
          ))}
        </ul>
      </div>

      {error && (
        <div className="mx-auto w-full max-w-5xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row">
        <section className="lg:w-1/3">
          <h2 className="mb-3 text-lg font-medium text-zinc-800 dark:text-zinc-200">
            Library
          </h2>
          <div className="space-y-2 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {listLoading ? (
              <div className="p-4 text-sm text-zinc-500">Loading videos…</div>
            ) : videos.length === 0 ? (
              <div className="p-4 text-sm text-zinc-500">
                No objects found in the bucket.
              </div>
            ) : (
              videos.map((video) => (
                <button
                  key={video.key}
                  onClick={() => handleSelect(video.key)}
                  className={`flex w-full flex-col rounded-xl border px-3 py-2 text-left transition ${
                    selectedKey === video.key
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/40 dark:text-blue-200"
                      : "border-transparent bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  }`}
                >
                  <span className="truncate text-sm font-medium">
                    {video.key}
                  </span>
                  <span className="mt-1 text-xs text-zinc-500">
                    {video.size
                      ? `${(video.size / 1024 / 1024).toFixed(2)} MB`
                      : "Unknown size"}
                  </span>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="flex-1">
          <h2 className="mb-3 text-lg font-medium text-zinc-800 dark:text-zinc-200">
            Player
          </h2>
          <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200/60 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            {videoLoading ? (
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Generating signed URL…
              </span>
            ) : videoUrl ? (
              <video
                key={videoUrl}
                controls
                className="h-full w-full object-cover"
                src={videoUrl}
              />
            ) : (
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Select a video to start playback.
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
