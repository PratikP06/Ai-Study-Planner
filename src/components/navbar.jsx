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

  const isDashboard = pathname.startsWith("/dashboard");

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50
      ${isDashboard ? "md:hidden" : ""}`}
    >
      <nav
        className="sticky top-0 w-full bg-neutral-950/40 backdrop-blur-2xl border-b border-white/10
          shadow-[0_0_20px_0px_rgba(255,255,255,0.03)] flex justify-between items-center px-8 h-16 sm:h-20"
      >
        <Link
          href={user ? "/dashboard" : "/"}
          className="text-xl sm:text-2xl font-bold tracking-tighter text-white font-[family-name:var(--font-space-grotesk)]"
        >
          StudyPlanner
        </Link>

        <nav className="flex items-center gap-4 sm:gap-8 text-sm">
          {user !== undefined &&
            (user ? (
              <>
                {!isDashboard && (
                  <Link
                    href="/dashboard"
                    className="hidden md:block text-neutral-400 font-medium hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-300"
                  >
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-2 rounded-full hover:bg-white/10 transition"
                >
                  <FiLogOut size={18} className="text-neutral-400 hover:text-white" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-neutral-400 font-medium hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-300"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  className="hidden sm:block px-6 py-2.5 rounded-full text-sm font-bold tracking-wider uppercase
                    bg-white text-[#1a1c1c] hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            ))}
        </nav>
      </nav>
    </header>
  );
}
