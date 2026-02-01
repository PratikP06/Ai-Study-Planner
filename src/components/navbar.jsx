"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import { useRouter } from "next/navigation";
export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header
      className="border-b"
      style={{ backgroundColor: "#F0EEEA", borderColor: "#D6CBBF" }}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left */}
        <Link
          href="/"
          className="font-semibold text-lg tracking-wide"
          style={{ color: "#3A4F4B" }}
        >
          StudyPlanner
        </Link>

        {/* Right */}
        <nav className="flex items-center gap-6 text-sm">
          {user ? (
            <>
              <Link href="/planner" style={{ color: "#6B7C78" }}>
                Planner
              </Link>
              <Link href="/history" style={{ color: "#6B7C78" }}>
                History
              </Link>
              <button
                onClick={logout}
                className="px-4 py-1.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: "#97B3AE", color: "#FFFFFF" }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "#97B3AE", color: "#FFFFFF" }}
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
