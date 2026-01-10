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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

        // Find the single featured film (only one can be featured at a time)
        const featured = filmsData.find((f) => f.featured);
        setFeaturedFilm(featured ?? null);
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
    // Use streaming API instead of signed URLs - never expires!
    setVideoUrl(`/api/stream?key=${encodeURIComponent(film.key)}`);
  };

  // modal stuff

  useEffect(() => {
    // prevent background scroll when modal is open
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsModalOpen(false);
    }
    if (isModalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen]);

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
