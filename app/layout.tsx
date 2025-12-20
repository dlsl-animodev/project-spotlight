import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FilmProvider } from "@/context/film-context";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Film Society Spotlight",
  description: "Film Society Spotlight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FilmProvider>
          <Navbar />
          {children}
          <Analytics />
        </FilmProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
