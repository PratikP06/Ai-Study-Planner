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
      className={`fixed top-0 left-0 right-0 z-50 px-4 pt-4
      ${isDashboard ? "md:hidden" : ""}`}
    >
      <div
        className="max-w-6xl mx-auto h-14 sm:h-16 rounded-3xl 
        flex items-center justify-between px-5 sm:px-8
        backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.05)]"
        style={{
          backgroundColor: "rgba(240,238,234,0.85)",
        }}
      >
        <Link
          href={user ? "/dashboard" : "/"}
          className="text-xl sm:text-2xl font-semibold tracking-wide text-[#3A4F4B]"
        >
          FlowState
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6 text-sm">
          {user !== undefined &&
            (user ? (
              <>
                {!isDashboard && (
                  <Link
                    href="/dashboard"
                    className="hidden md:block text-[#6B7C78] hover:opacity-80 transition"
                  >
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-2 rounded-full hover:bg-[#97B3AE]/15 transition"
                >
                  <FiLogOut size={20} className="text-[#3A4F4B]" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#6B7C78] hover:opacity-80 transition"
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="hidden sm:block px-5 py-2 rounded-full text-sm font-medium bg-[#97B3AE] text-white"
                >
                  Get Started
                </Link>
              </>
            ))}
        </nav>
      </div>
    </header>
  );
}
