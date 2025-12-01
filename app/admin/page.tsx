"use client";

import { auth } from "@/libs/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

export default function Page() {
  const [allowed, setAllowed] = useState(false);
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
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
    </div>
  );
}
