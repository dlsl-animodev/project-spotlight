"use client";

import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import { Film, Code, Users, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 py-20 md:py-32">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/20" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/20" />
            <div className="absolute right-1/4 top-1/2 h-48 w-48 rounded-full bg-white/10" />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />A Collaboration Project
              </span>
              <h1 className="mt-6 text-4xl font-black text-white md:text-6xl lg:text-7xl">
                About Project
                <br />
                <span className="text-white/90">Spotlight</span>
              </h1>
            </motion.div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="prose prose-lg prose-zinc mx-auto"
            >
              <p className="text-xl leading-relaxed text-zinc-700 md:text-2xl">
                <span className="font-semibold text-red-600">
                  Project Spotlight
                </span>{" "}
                is a collaboration between{" "}
                <span className="font-semibold">Animo.dev</span> and the{" "}
                <span className="font-semibold">Film Society</span> to give
                students a space to watch and enjoy films made by fellow
                Lasallians.
              </p>

              <p className="mt-6 text-lg leading-relaxed text-zinc-600">
                This website serves as a digital theater where the Film Society
                can showcase their work, share their stories, and reach more
                viewers across campus.
              </p>

              <p className="mt-6 text-lg leading-relaxed text-zinc-600">
                The platform is built and designed by Animo.dev members,
                combining web development skills with the creativity of student
                filmmakers. Our goal is to make a simple, smooth, and enjoyable
                viewing experience where anyone can explore films, learn more
                about each production, and support the growing filmmaking
                community at DLSL.
              </p>

              <p className="mt-6 text-lg font-medium leading-relaxed text-zinc-700">
                Project Spotlight aims to celebrate student creativity, make
                films more accessible, and shine a light on the talent within
                the university.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-zinc-50 py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center text-3xl font-bold text-zinc-900 md:text-4xl"
            >
              What We <span className="text-red-600">Offer</span>
            </motion.h2>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group rounded-2xl bg-white p-8 shadow-sm transition hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-xl bg-red-100 p-3">
                  <Film className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-zinc-900">
                  Digital Theater
                </h3>
                <p className="text-zinc-600">
                  A dedicated space to watch student-made films anytime,
                  anywhere on campus.
                </p>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group rounded-2xl bg-white p-8 shadow-sm transition hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-xl bg-red-100 p-3">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-zinc-900">
                  Community
                </h3>
                <p className="text-zinc-600">
                  Supporting and growing the filmmaking community at DLSL, one
                  film at a time.
                </p>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="group rounded-2xl bg-white p-8 shadow-sm transition hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-xl bg-red-100 p-3">
                  <Sparkles className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-zinc-900">
                  Accessibility
                </h3>
                <p className="text-zinc-600">
                  Making student films more accessible to everyone across the
                  university.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Collaboration Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center text-3xl font-bold text-zinc-900 md:text-4xl"
            >
              A <span className="text-red-600">Collaboration</span>
            </motion.h2>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Animo.dev */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 md:p-10"
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-600/10" />
                <div className="relative">
                  <div className="mb-4 inline-flex rounded-xl bg-white/10 p-3">
                    <Code className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-white">
                    Animo.dev
                  </h3>
                  <p className="text-zinc-400">
                    The development team behind Project Spotlight. We handle the
                    technical side — building, designing, and maintaining the
                    platform to ensure a smooth experience for everyone.
                  </p>
                </div>
              </motion.div>

              {/* Film Society */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-red-700 p-8 md:p-10"
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                <div className="relative">
                  <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3">
                    <Film className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-white">
                    Film Society
                  </h3>
                  <p className="text-white/80">
                    The creative minds producing the films you see here. They
                    bring stories to life through cinema and share their passion
                    with the DLSL community.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="border-t border-zinc-100 py-12">
          <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-4"
            >
              <p className="text-lg text-zinc-600">
                made by{" "}
                <Link
                  href="https://www.facebook.com/profile.php?id=61577729247232"
                  className="text-zinc-100 bg-red-600 p-0.5"
                >
                  Animo.dev
                </Link>
              </p>
              <Link
                href="/"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                <Film className="h-5 w-5" />
                Start Watching
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
