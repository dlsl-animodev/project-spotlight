"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { db } from "@/libs/firebase";
import { getDocs, collection } from "firebase/firestore";
import { Film } from "@/type/film-type";

interface FilmContextType {
  films: Film[];
  featuredFilm: Film | null;
  selectedFilm: Film | null;
  videoUrl: string | null;
  loading: boolean;
  handleSelect: (film: Film) => Promise<void>;
  closeVideo: () => void;
}

const FilmContext = createContext<FilmContextType | undefined>(undefined);

export function FilmProvider({ children }: { children: React.ReactNode }) {
  const [films, setFilms] = useState<Film[]>([]);
  const [featuredFilm, setFeaturedFilm] = useState<Film | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all films from Firestore
  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const response = await getDocs(collection(db, "films"));
        const filmsData = response.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Film[];

        setFilms(filmsData);

        // Determine featured film
        const featured = filmsData.filter((f) => f.featured);
        const latest =
          featured.length > 0
            ? featured.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )[0]
            : filmsData.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )[0];

        setFeaturedFilm(latest ?? null);
      } catch (err) {
        console.error("Error fetching films:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilms();
  }, []);

  // Handle film selection and video fetch
  const handleSelect = async (film: Film) => {
    setSelectedFilm(film);
    try {
      const res = await fetch(
        `/api/signed-url?key=${encodeURIComponent(film.key)}`
      );
      if (!res.ok) throw new Error(`Failed to get signed URL`);
      const data = await res.json();
      setVideoUrl(data.url ?? null);
    } catch (err) {
      console.error("signed url fetch error", err);
      setVideoUrl(null);
    }
  };

  const closeVideo = () => setVideoUrl(null);

  return (
    <FilmContext.Provider
      value={{
        films,
        featuredFilm,
        selectedFilm,
        videoUrl,
        loading,
        handleSelect,
        closeVideo,
      }}
    >
      {children}
    </FilmContext.Provider>
  );
}

export function useFilm() {
  const ctx = useContext(FilmContext);
  if (!ctx) throw new Error("useFilm must be used within FilmProvider");
  return ctx;
}
