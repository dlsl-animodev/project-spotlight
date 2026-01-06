"use client";

import { auth, db } from "@/libs/firebase";
import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Film, Announcement } from "@/type/film-type";
import {
  LayoutDashboard,
  Film as FilmIcon,
  Pencil,
  Trash2,
  LogOut,
  BarChart3,
  Users,
  Eye,
  Star,
  Menu,
  X,
  Upload,
  Clock,
  TrendingUp,
  Globe,
  Monitor,
  RefreshCw,
  Megaphone,
} from "lucide-react";
import UploadFilm from "@/components/upload-film";
import UploadUpcoming from "@/components/upload-upcoming";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import Link from "next/link";
import UploadAnnouncements from "@/components/upload-announcements";
import { fetchAnnouncements } from "@/components/navbar";

type ActiveTab =
  | "dashboard"
  | "films"
  | "upload"
  | "upcoming"
  | "announcements";

export default function AdminDashboard() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [films, setFilms] = useState<Film[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bucketStats, setBucketStats] = useState<{
    totalSizeGB: number;
    usagePercentage: number;
    remainingGB: number;
    totalObjects: number;
    isNearLimit: boolean;
    isOverLimit: boolean;
  } | null>(null);

  // Announcement state
  const [currentAnnouncement, setCurrentAnnouncement] =
    useState<Announcement | null>(null);
  const [isEditAnnouncementOpen, setIsEditAnnouncementOpen] = useState(false);
  const [editAnnouncementMessage, setEditAnnouncementMessage] = useState("");

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    actors: "",
    director: "",
    genre: "",
    releaseDate: "",
    duration: "",
    rating: "",
    featured: false,
  });

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/admin/login";
        return;
      }
      if (
        user.email === "filmsociety@dlsl.edu.ph" ||
        user.email === "developers.society@dlsl.edu.ph"
      ) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch films
  const fetchFilms = useCallback(async () => {
    try {
      const response = await getDocs(collection(db, "films"));
      const filmsData = response.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Film[];
      setFilms(filmsData);
    } catch (error) {
      console.error("Error fetching films:", error);
    }
  }, []);

  // Fetch current announcement
  const loadCurrentAnnouncement = useCallback(async () => {
    const announcement = await fetchAnnouncements();
    setCurrentAnnouncement(announcement);
  }, []);

  useEffect(() => {
    if (allowed) {
      fetchFilms();
      fetchBucketStats();
      loadCurrentAnnouncement();
    }
  }, [allowed, fetchFilms, loadCurrentAnnouncement]);

  // Fetch bucket stats
  const fetchBucketStats = async () => {
    try {
      const response = await fetch("/api/bucket-stats");
      if (response.ok) {
        const stats = await response.json();
        setBucketStats(stats);
      }
    } catch (error) {
      console.error("Error fetching bucket stats:", error);
    }
  };

  const upcomingFilms = films.filter((film) => film.status === "upcoming");

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/admin/login";
  };

  // Form handlers
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      actors: "",
      director: "",
      genre: "",
      releaseDate: "",
      duration: "",
      rating: "",
      featured: false,
    });
  };

  const openEditDialog = (film: Film) => {
    setSelectedFilm(film);
    setFormData({
      title: film.title,
      description: film.description,
      actors: film.actors?.join(", ") || "",
      director: film.director || "",
      genre: film.genre?.join(", ") || "",
      releaseDate: film.releaseDate || "",
      duration: film.duration?.toString() || "",
      rating: film.rating || "",
      featured: film.featured || false,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (film: Film) => {
    setSelectedFilm(film);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateFilm = async () => {
    if (!selectedFilm) return;
    try {
      // If marking as featured, un-feature all other films first
      if (formData.featured && !selectedFilm.featured) {
        const currentFeatured = films.filter(
          (f) => f.featured && f.id !== selectedFilm.id
        );
        for (const film of currentFeatured) {
          await updateDoc(doc(db, "films", film.id), { featured: false });
        }
      }

      const filmRef = doc(db, "films", selectedFilm.id);
      await updateDoc(filmRef, {
        title: formData.title,
        description: formData.description,
        actors: formData.actors
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        director: formData.director,
        genre: formData.genre
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
        releaseDate: formData.releaseDate,
        duration: formData.duration ? Number(formData.duration) : undefined,
        rating: formData.rating,
        featured: formData.featured,
      });
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedFilm(null);
      fetchFilms();
    } catch (error) {
      console.error("Error updating film:", error);
    }
  };

  const handleDeleteFilm = async () => {
    if (!selectedFilm) return;
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "films", selectedFilm.id));

      // Delete files from R2
      const deleteResponse = await fetch("/api/delete-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoKey: selectedFilm.key,
          thumbnailKey: selectedFilm.thumbnailKey,
          coverphotoKey: selectedFilm.coverphotoKey,
        }),
      });

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete files from R2");
      }

      setIsDeleteDialogOpen(false);
      setSelectedFilm(null);
      fetchFilms();
      fetchBucketStats();
      toast.success(`"${selectedFilm.title}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting film:", error);
      toast.error("Failed to delete film. Please try again.");
    }
  };

  // Announcement handlers
  const handleDeleteAnnouncement = async () => {
    if (!currentAnnouncement?.id) return;
    try {
      await deleteDoc(doc(db, "announcements", currentAnnouncement.id));
      setCurrentAnnouncement(null);
      window.dispatchEvent(new CustomEvent("announcementAdded"));
      toast.success("Announcement deleted successfully");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement");
    }
  };

  const handleEditAnnouncement = async () => {
    if (!currentAnnouncement?.id || !editAnnouncementMessage.trim()) return;
    try {
      await updateDoc(doc(db, "announcements", currentAnnouncement.id), {
        message: editAnnouncementMessage,
      });
      setCurrentAnnouncement({
        ...currentAnnouncement,
        message: editAnnouncementMessage,
      });
      setIsEditAnnouncementOpen(false);
      window.dispatchEvent(new CustomEvent("announcementAdded"));
      toast.success("Announcement updated successfully");
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast.error("Failed to update announcement");
    }
  };

  const getTimeUntilExpiration = (expiresAt: Date) => {
    const now = new Date();
    const expiry =
      expiresAt instanceof Date
        ? expiresAt
        : (expiresAt as { toDate?: () => Date })?.toDate?.() ||
          new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  // Chart data
  const genreData = films.reduce(
    (acc: { name: string; count: number }[], film) => {
      film.genre?.forEach((genre) => {
        const existing = acc.find((g) => g.name === genre);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ name: genre, count: 1 });
        }
      });
      return acc;
    },
    []
  );

  const monthlyData = films.reduce(
    (acc: { month: string; count: number }[], film) => {
      if (film.createdAt) {
        const month = new Date(film.createdAt).toLocaleString("default", {
          month: "short",
        });
        const existing = acc.find((m) => m.month === month);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ month, count: 1 });
        }
      }
      return acc;
    },
    []
  );

  const COLORS = ["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca"];

  const chartConfig = {
    count: { label: "Count", color: "#dc2626" },
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-red-600">Loading...</div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-zinc-600">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      {/* Sidebar (responsive) */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${sidebarOpen ? "md:w-64" : "md:w-20"} w-64`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4"
        >
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-red-600">SPOTLIGHT</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </Link>

        {/* Nav Items */}
        <nav className="mt-6 px-3">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 transition ${
              activeTab === "dashboard"
                ? "bg-red-600 text-white"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button
            onClick={() => setActiveTab("films")}
            className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 transition ${
              activeTab === "films"
                ? "bg-red-600 text-white"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <FilmIcon className="h-5 w-5" />
            {sidebarOpen && <span>Films</span>}
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 transition ${
              activeTab === "upcoming"
                ? "bg-red-600 text-white"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Clock className="h-5 w-5" />
            {sidebarOpen && <span>Upcoming Films</span>}
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 transition ${
              activeTab === "upload"
                ? "bg-red-600 text-white"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Upload className="h-5 w-5" />
            {sidebarOpen && <span>Upload Film</span>}
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 transition ${
              activeTab === "announcements"
                ? "bg-red-600 text-white"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            {sidebarOpen && <span>Announcements</span>}
          </button>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-zinc-700 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile backdrop when sidebar is open (click to close) */}
      <div
        className={`fixed inset-0 z-30 bg-black/30 md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-20"
        } ml-0`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 md:px-6">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              className="mr-3 inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              {activeTab === "dashboard"
                ? "Dashboard"
                : activeTab === "films"
                ? "Films Management"
                : activeTab === "upload"
                ? "Upload Film"
                : activeTab === "upcoming"
                ? "Upcoming Films Management"
                : activeTab === "announcements"
                ? "Announcements"
                : "Analytics"}
            </h2>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div
                  className={`rounded-xl border p-6 shadow-sm ${
                    bucketStats?.isOverLimit
                      ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      : bucketStats?.isNearLimit
                      ? "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                      : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-center mb-2">
                        <div
                          className={`rounded-full p-3 ${
                            bucketStats?.isOverLimit
                              ? "bg-red-200"
                              : bucketStats?.isNearLimit
                              ? "bg-yellow-200"
                              : "bg-red-100"
                          }`}
                        >
                          <BarChart3
                            className={`h-6 w-6 ${
                              bucketStats?.isOverLimit
                                ? "text-red-700"
                                : bucketStats?.isNearLimit
                                ? "text-yellow-700"
                                : "text-red-600"
                            }`}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                        Storage Used
                      </p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white text-center">
                        {bucketStats
                          ? `${bucketStats.totalSizeGB.toFixed(2)}`
                          : "..."}{" "}
                        GB
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-center">
                        {bucketStats
                          ? `${bucketStats.remainingGB.toFixed(2)}`
                          : "..."}{" "}
                        GB remaining
                      </p>
                      {bucketStats && (
                        <div className="mt-2 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                          <div
                            className={`h-full rounded-full ${
                              bucketStats.isOverLimit
                                ? "bg-red-600"
                                : bucketStats.isNearLimit
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                bucketStats.usagePercentage,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm">
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3 mb-3">
                      <FilmIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                      Released Films
                    </p>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-white text-center">
                      {films.filter((f) => f.status === "released").length}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm">
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3 mb-3">
                      <Clock className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                      Upcoming Films
                    </p>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-white text-center">
                      {
                        films.filter(
                          (f) =>
                            f.status === "upcoming" ||
                            f.status === "coming-soon"
                        ).length
                      }
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm">
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3 mb-3">
                      <Star className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                      Featured Film
                    </p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white text-center truncate max-w-[150px]">
                      {films.find((f) => f.featured)?.title || "None"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Bar Chart - Films by Month */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                    Films Added by Month
                  </h3>
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                  >
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="count"
                        fill="#dc2626"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>

                {/* Pie Chart - Films by Genre */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                    Films by Genre
                  </h3>
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                  >
                    <PieChart>
                      <Pie
                        data={genreData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#dc2626"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {genreData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </div>
              </div>

              {/* Recent Films */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                  Recent Films
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-zinc-200 dark:border-zinc-700 text-sm text-zinc-500 dark:text-zinc-400">
                      <tr>
                        <th className="pb-3 font-medium">Title</th>
                        <th className="pb-3 font-medium">Genre</th>
                        <th className="pb-3 font-medium">Duration</th>
                        <th className="pb-3 font-medium">Featured</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                      {films.slice(0, 5).map((film) => (
                        <tr key={film.id} className="text-sm">
                          <td className="py-3 font-medium text-zinc-900 dark:text-white">
                            {film.title}
                          </td>
                          <td className="py-3 text-zinc-600 dark:text-zinc-400">
                            {film.genre?.join(", ")}
                          </td>
                          <td className="py-3 text-zinc-600 dark:text-zinc-400">
                            {film.duration || "-"} min
                          </td>
                          <td className="py-3">
                            {film.featured ? (
                              <span className="rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-600">
                                Featured
                              </span>
                            ) : (
                              <span className="text-zinc-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "films" && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-600 dark:text-zinc-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Title</th>
                      <th className="px-6 py-4 font-medium">Director</th>
                      <th className="px-6 py-4 font-medium">Genre</th>
                      <th className="px-6 py-4 font-medium">Duration</th>
                      <th className="px-6 py-4 font-medium">Rating</th>
                      <th className="px-6 py-4 font-medium">Featured</th>
                      <th className="px-6 py-4 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                    {films.map((film) => (
                      <tr
                        key={film.id}
                        className="text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                      >
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                          {film.title}
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                          {film.director || "-"}
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                          {film.genre?.join(", ") || "-"}
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                          {film.duration || "-"} min
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-600">
                            {film.rating || "NR"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {film.featured ? (
                            <Star className="h-5 w-5 fill-red-600 text-red-600" />
                          ) : (
                            <Star className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditDialog(film)}
                              className="rounded-lg p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteDialog(film)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Upload New Film
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Add a new movie by uploading the video and its cover image.
                  </p>
                </div>
                <UploadFilm onSuccess={fetchFilms} />
              </div>
              <div className="space-y-6">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      Add Upcoming Film
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Add an upcoming or coming soon film (no video required).
                    </p>
                  </div>
                  <UploadUpcoming onSuccess={fetchFilms} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "upcoming" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-600 dark:text-zinc-400">
                      <tr>
                        <th className="px-6 py-4 font-medium">Title</th>
                        <th className="px-6 py-4 font-medium">Director</th>
                        <th className="px-6 py-4 font-medium">Genre</th>
                        <th className="px-6 py-4 font-medium">Duration</th>
                        <th className="px-6 py-4 font-medium">Rating</th>
                        <th className="px-6 py-4 font-medium">Featured</th>
                        <th className="px-6 py-4 font-medium text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                      {upcomingFilms.map((film) => (
                        <tr
                          key={film.id}
                          className="text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                        >
                          <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                            {film.title}
                          </td>
                          <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                            {film.director || "-"}
                          </td>
                          <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                            {film.genre?.join(", ") || "-"}
                          </td>
                          <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                            {film.duration || "-"} min
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-600">
                              {film.rating || "NR"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {film.featured ? (
                              <Star className="h-5 w-5 fill-red-600 text-red-600" />
                            ) : (
                              <Star className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditDialog(film)}
                                className="rounded-lg p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteDialog(film)}
                                className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "announcements" && (
            <div className="space-y-6">
              {/* Current Announcement */}
              {currentAnnouncement && (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Megaphone className="h-5 w-5 text-red-600" />
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                          Current Announcement
                        </h3>
                      </div>
                      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-3">
                        <p className="text-zinc-900 dark:text-white font-medium">
                          {currentAnnouncement.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                        <span
                          className={`font-medium ${
                            getTimeUntilExpiration(
                              currentAnnouncement.expiresAt
                            ) === "Expired"
                              ? "text-red-600"
                              : "text-zinc-600 dark:text-zinc-300"
                          }`}
                        >
                          {getTimeUntilExpiration(
                            currentAnnouncement.expiresAt
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditAnnouncementMessage(
                            currentAnnouncement.message
                          );
                          setIsEditAnnouncementOpen(true);
                        }}
                        className="rounded-lg p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleDeleteAnnouncement}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* No Announcement */}
              {!currentAnnouncement && (
                <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 p-8 text-center">
                  <Megaphone className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                    No active announcement
                  </p>
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
                    Create one below to display on the homepage
                  </p>
                </div>
              )}

              {/* Add Announcement */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Add New Announcement
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Add a new announcement to the homepage
                  </p>
                </div>
                <UploadAnnouncements onSuccess={loadCurrentAnnouncement} />
              </div>

              {/* Edit Announcement Dialog */}
              <Dialog
                open={isEditAnnouncementOpen}
                onOpenChange={setIsEditAnnouncementOpen}
              >
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-red-600">
                      Edit Announcement
                    </DialogTitle>
                    <DialogDescription>
                      Update the announcement message below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      value={editAnnouncementMessage}
                      onChange={(e) =>
                        setEditAnnouncementMessage(e.target.value)
                      }
                      placeholder="Enter announcement message"
                      className="min-h-[100px]"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditAnnouncementOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEditAnnouncement}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </main>

      {/* Edit Film Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600">Edit Film</DialogTitle>
            <DialogDescription>
              Update the film details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter film title"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter film description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Director
                </label>
                <Input
                  value={formData.director}
                  onChange={(e) =>
                    setFormData({ ...formData, director: e.target.value })
                  }
                  placeholder="Director name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Rating
                </label>
                <Input
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: e.target.value })
                  }
                  placeholder="PG-13, R, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Genre
                </label>
                <Input
                  value={formData.genre}
                  onChange={(e) =>
                    setFormData({ ...formData, genre: e.target.value })
                  }
                  placeholder="Action, Drama"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Duration (min)
                </label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="120"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Actors
              </label>
              <Input
                value={formData.actors}
                onChange={(e) =>
                  setFormData({ ...formData, actors: e.target.value })
                }
                placeholder="Actor 1, Actor 2"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Release Date
              </label>
              <Input
                type="date"
                value={formData.releaseDate}
                onChange={(e) =>
                  setFormData({ ...formData, releaseDate: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-featured"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="edit-featured" className="text-sm text-zinc-700">
                Mark as Featured
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateFilm}
              className="bg-red-600 hover:bg-red-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Film</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedFilm?.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteFilm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
