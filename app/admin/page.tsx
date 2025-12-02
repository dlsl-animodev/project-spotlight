"use client";

import { auth, db } from "@/libs/firebase";
import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Film } from "@/type/film-type";
import {
  LayoutDashboard,
  Film as FilmIcon,
  Plus,
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
} from "lucide-react";
import UploadFilm from "@/components/upload-film";
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
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";

type ActiveTab = "dashboard" | "films" | "upload";

export default function AdminDashboard() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [films, setFilms] = useState<Film[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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

  useEffect(() => {
    if (allowed) {
      fetchFilms();
    }
  }, [allowed, fetchFilms]);

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
      await deleteDoc(doc(db, "films", selectedFilm.id));
      setIsDeleteDialogOpen(false);
      setSelectedFilm(null);
      fetchFilms();
    } catch (error) {
      console.error("Error deleting film:", error);
    }

    await fetch("/api/delete-files", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoKey: selectedFilm?.key,
        thumbnailKey: selectedFilm?.thumbnailKey,
      }),
    });
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
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar (responsive) */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-zinc-200 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${sidebarOpen ? "md:w-64" : "md:w-20"} w-64`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-red-600">SPOTLIGHT</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="mt-6 px-3">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 transition ${
              activeTab === "dashboard"
                ? "bg-red-600 text-white"
                : "text-zinc-700 hover:bg-zinc-100"
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
                : "text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <FilmIcon className="h-5 w-5" />
            {sidebarOpen && <span>Films</span>}
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 transition ${
              activeTab === "upload"
                ? "bg-red-600 text-white"
                : "text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <Upload className="h-5 w-5" />
            {sidebarOpen && <span>Upload Film</span>}
          </button>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-zinc-700 hover:bg-red-50 hover:text-red-600 transition"
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              className="mr-3 inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-zinc-900">
              {activeTab === "dashboard"
                ? "Dashboard"
                : activeTab === "films"
                ? "Films Management"
                : "Upload Film"}
            </h2>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">Total Films</p>
                      <p className="text-3xl font-bold text-zinc-900">
                        {films.length}
                      </p>
                    </div>
                    <div className="rounded-full bg-red-100 p-3">
                      <FilmIcon className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">Featured Films</p>
                      <p className="text-3xl font-bold text-zinc-900">
                        {films.filter((f) => f.featured).length}
                      </p>
                    </div>
                    <div className="rounded-full bg-red-100 p-3">
                      <Star className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">Genres</p>
                      <p className="text-3xl font-bold text-zinc-900">
                        {genreData.length}
                      </p>
                    </div>
                    <div className="rounded-full bg-red-100 p-3">
                      <BarChart3 className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">Avg Duration</p>
                      <p className="text-3xl font-bold text-zinc-900">
                        {films.length > 0
                          ? Math.round(
                              films.reduce(
                                (acc, f) => acc + (f.duration || 0),
                                0
                              ) / films.filter((f) => f.duration).length || 0
                            )
                          : 0}{" "}
                        <span className="text-lg font-normal text-zinc-500">
                          min
                        </span>
                      </p>
                    </div>
                    <div className="rounded-full bg-red-100 p-3">
                      <Eye className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Bar Chart - Films by Month */}
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-zinc-900">
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
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-zinc-900">
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
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-zinc-900">
                  Recent Films
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-zinc-200 text-sm text-zinc-500">
                      <tr>
                        <th className="pb-3 font-medium">Title</th>
                        <th className="pb-3 font-medium">Genre</th>
                        <th className="pb-3 font-medium">Duration</th>
                        <th className="pb-3 font-medium">Featured</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {films.slice(0, 5).map((film) => (
                        <tr key={film.id} className="text-sm">
                          <td className="py-3 font-medium text-zinc-900">
                            {film.title}
                          </td>
                          <td className="py-3 text-zinc-600">
                            {film.genre?.join(", ")}
                          </td>
                          <td className="py-3 text-zinc-600">
                            {film.duration || "-"} min
                          </td>
                          <td className="py-3">
                            {film.featured ? (
                              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
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
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-zinc-200 bg-zinc-50 text-sm text-zinc-600">
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
                  <tbody className="divide-y divide-zinc-100">
                    {films.map((film) => (
                      <tr key={film.id} className="text-sm hover:bg-zinc-50">
                        <td className="px-6 py-4 font-medium text-zinc-900">
                          {film.title}
                        </td>
                        <td className="px-6 py-4 text-zinc-600">
                          {film.director || "-"}
                        </td>
                        <td className="px-6 py-4 text-zinc-600">
                          {film.genre?.join(", ") || "-"}
                        </td>
                        <td className="px-6 py-4 text-zinc-600">
                          {film.duration || "-"} min
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
                            {film.rating || "NR"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {film.featured ? (
                            <Star className="h-5 w-5 fill-red-600 text-red-600" />
                          ) : (
                            <Star className="h-5 w-5 text-zinc-300" />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditDialog(film)}
                              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteDialog(film)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
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
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900">
                    Upload New Film
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Add a new movie by uploading the video and its cover image.
                  </p>
                </div>
                <UploadFilm onSuccess={fetchFilms} />
              </div>
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
