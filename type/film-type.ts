export type Film = {
  id: string; // Unique identifier
  title: string; // Movie title
  description: string; // Short description
  actors: string[]; // List of actors/actresses
  director?: string; // Optional director field
  key: string; // Cloudflare R2 key for the video file
  thumbnailKey?: string; // Cloudflare R2 key for thumbnail/poster
  coverphotoKey?: string; // Cloudflare R2 key for cover photo/banner
  genre: string[]; // e.g., ['Action', 'Drama']
  releaseDate: string; // ISO date string
  duration?: number; // Length in minutes
  rating?: string; // e.g, 'PG-13', 'R'
  createdAt: string; // When added to your system
  featured?: boolean; // For homepage or featured section
  status?: "released" | "upcoming" | "coming-soon"; // Film status
  viewCount?: number; // Number of views
};

export type Announcement = {
  id?: string; // Document ID
  message: string; // Announcement message
  createdAt: Date; // When the announcement was created
  expiresAt: Date; // When the announcement expires
};
