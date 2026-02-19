"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import { useRouter, usePathname } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

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

  // Hide navbar on dashboard pages
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full px-4">
      <div
        className="max-w-6xl mx-auto h-14 sm:h-16 rounded-2xl flex items-center justify-between px-5 sm:px-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
        style={{
          backgroundColor: "rgba(246,243,237,0.85)",
          border: "1px solid #D6CBBF",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-xl sm:text-2xl font-semibold tracking-wide"
          style={{ color: "#3A4F4B" }}
        >
          FlowState
        </Link>

        {/* Right Side */}
        <nav className="flex items-center gap-4 text-sm">
          {user !== undefined && (
            user ? (
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-[#97B3AE]/20 transition"
                aria-label="Logout"
              >
                <FiLogOut size={20} color="#3A4F4B" />
              </button>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-sm font-medium transition hover:opacity-90"
                style={{
                  backgroundColor: "#97B3AE",
                  color: "#FFFFFF",
                }}
              >
                Login
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
