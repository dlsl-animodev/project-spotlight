"use client";

import { db } from "@/libs/firebase";
import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import UploadFilm from "@/components/upload-film";
import { Film } from "@/type/film-type";
import { Play } from "lucide-react";

export default function Home() {
  const [films, setFilms] = useState<Film[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilmsFromFirestore = async () => {
      try {
        const response = await getDocs(collection(db, "films"));
        const filmsData = response.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Film[];
        setFilms(filmsData);

        // Set first featured film or first film as default
        const featured = filmsData.find((f) => f.featured) || filmsData[0];
        if (featured) {
          setSelectedFilm(featured);
        }
      } catch (error) {
        console.error("Error fetching films from Firestore:", error);
      } finally {
        setListLoading(false);
      }
    };
    fetchFilmsFromFirestore();
  }, []);

  const handleSelect = async (film: Film) => {
    setSelectedFilm(film);

    try {
      const res = await fetch(
        `/api/signed-url?key=${encodeURIComponent(film.key)}`
      );
      if (!res.ok) {
        throw new Error(`signed url request failed (${res.status})`);
      }
      const data = await res.json();
      setVideoUrl(data.url ?? null);
    } catch (err) {
      console.error("signed url fetch error", err);
      setVideoUrl(null);
    }
  };

  const featuredFilm = films.find((f) => f.featured) || films[0];

  if (listLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading films...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-white px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-red-600">SPOTLIGHT</h1>
          <UploadFilm />
        </div>
      </header>

      {/* Featured Film Hero Section */}
      {featuredFilm && (
        <section className="relative min-h-screen w-full bg-white pt-24">
          {/* Featured Content - Centered */}
          <div className="relative z-10 flex flex-col items-center px-8 py-16 text-center md:px-16 lg:px-24">
            <div className="max-w-5xl space-y-8">
              {/* Mega Bold Red Title */}
              <h2 className="text-7xl font-black text-red-600 md:text-8xl lg:text-9xl">
                {featuredFilm.title.toUpperCase()}
              </h2>

              {/* Thumbnail Image */}
              <div className="mx-auto w-full max-w-2xl">
                <img
                  src={`https://via.placeholder.com/800x450/333/fff?text=${encodeURIComponent(
                    featuredFilm.title
                  )}`}
                  alt={featuredFilm.title}
                  className="w-full rounded-lg shadow-2xl"
                />
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-center gap-4 text-sm text-zinc-800">
                <span className="rounded bg-red-600 px-3 py-1 font-semibold text-white">
                  {featuredFilm.rating || "NR"}
                </span>
                <span className="font-medium">
                  {featuredFilm.releaseDate?.split("-")[0]}
                </span>
                <span className="font-medium">
                  {featuredFilm.duration ? `${featuredFilm.duration} min` : ""}
                </span>
                <span className="font-medium">
                  {featuredFilm.genre?.join(", ")}
                </span>
              </div>

              {/* Description */}
              <p className="mx-auto max-w-3xl text-lg leading-relaxed text-zinc-700 md:text-xl">
                {featuredFilm.description}
              </p>

              {/* Actors/Actresses */}
              {featuredFilm.actors && featuredFilm.actors.length > 0 && (
                <div className="text-zinc-800">
                  <h3 className="mb-2 text-xl font-bold">Starring</h3>
                  <p className="text-lg text-zinc-600">
                    {featuredFilm.actors.join(", ")}
                  </p>
                </div>
              )}

              {/* Director */}
              {featuredFilm.director && (
                <div className="text-zinc-800">
                  <span className="font-semibold">Director: </span>
                  <span className="text-zinc-600">{featuredFilm.director}</span>
                </div>
              )}

              {/* Play Button */}
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => handleSelect(featuredFilm)}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-10 py-4 text-lg font-bold text-white transition hover:bg-red-700"
                >
                  <Play className="h-6 w-6 fill-white" />
                  PLAY NOW
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Video Player Modal */}
      {videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
          <div className="relative w-full max-w-6xl">
            <button
              onClick={() => setVideoUrl(null)}
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
      )}

      {/* Films Grid */}
      <section className="bg-zinc-50 px-8 py-16 md:px-16 lg:px-24">
        <h3 className="mb-6 text-3xl font-bold text-zinc-900">All Films</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {films.map((film) => (
            <button
              key={film.id}
              onClick={() => handleSelect(film)}
              className="group relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900 transition-transform hover:scale-105 hover:z-10"
            >
              {/* Thumbnail Image */}
              <img
                src={`https://via.placeholder.com/400x600/333/fff?text=${encodeURIComponent(
                  film.title
                )}`}
                alt={film.title}
                className="h-full w-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-100" />

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="text-lg font-bold text-white">{film.title}</h4>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-300">
                  {film.rating && (
                    <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold">
                      {film.rating}
                    </span>
                  )}
                  <span>{film.releaseDate?.split("-")[0]}</span>
                </div>
              </div>

              {/* Play Button on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                  <Play className="h-8 w-8 fill-white text-white" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
