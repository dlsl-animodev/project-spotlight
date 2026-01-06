"use client";

import { Input } from "@/components/ui/input";
import { auth } from "@/libs/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/admin";
    } catch (err: any) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950 px-4 transition-colors">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-zinc-900 p-6 shadow-md">
        <h2 className="text-center text-2xl font-bold text-red-600">
          Film Society Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            className="border-red-300 dark:border-red-800 dark:bg-zinc-800 dark:text-white focus-visible:ring-red-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            className="border-red-300 dark:border-red-800 dark:bg-zinc-800 dark:text-white focus-visible:ring-red-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-red-600 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
