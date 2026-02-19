"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState(undefined); 
   
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full px-4">
      <div
        className="max-w-6xl mx-auto h-16 rounded-3xl flex items-center justify-between px-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
        style={{
          backgroundColor: "rgba(246,243,237,0.85)",
          border: "1px solid #D6CBBF",
        }}
      >
        <Link
          href="/"
          className="text-2xl font-semibold tracking-wide"
          style={{ color: "#3A4F4B" }}
        >
          FlowState
        </Link>

        <nav className="flex items-center gap-6 text-sm">
                    {user !== undefined && (
            user ? (
              <>
                <Link
                  href="/dashboard"
                  className="transition hover:opacity-80"
                  style={{ color: "#6B7C78" }}
                >
                  Dashboard
                </Link>

                <button
                  onClick={logout}
                  className="px-5 py-2 rounded-full text-sm font-medium transition hover:opacity-90"
                  style={{
                    backgroundColor: "#97B3AE",
                    color: "#FFFFFF",
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="transition hover:opacity-80"
                  style={{ color: "#6B7C78" }}
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="px-5 py-2 rounded-full text-sm font-medium transition hover:opacity-90"
                  style={{
                    backgroundColor: "#97B3AE",
                    color: "#FFFFFF",
                  }}
                >
                  Get Started
                </Link>
              </>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
