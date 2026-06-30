"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Benefits", href: "#benefits" },
];

export default function LandingNav({ user }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:pt-6">
      <nav
        className={`w-full max-w-5xl flex items-center justify-between rounded-full px-5 sm:px-6 transition-all duration-500 ${
          scrolled
            ? "h-14 bg-[#131313]/70 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            : "h-16 bg-transparent border border-transparent"
        }`}
      >
        <Link
          href="/"
          className="font-[family-name:var(--font-space-grotesk)] text-base sm:text-lg font-bold tracking-tight text-white shrink-0"
        >
          Flow State
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-full text-[13px] text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-300"
            aria-label="GitHub repository"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.5 0 12.3c0 5.44 3.44 10.05 8.21 11.68.6.12.82-.27.82-.6 0-.3-.01-1.08-.02-2.12-3.34.75-4.04-1.66-4.04-1.66-.55-1.43-1.34-1.82-1.34-1.82-1.09-.77.08-.75.08-.75 1.2.09 1.84 1.27 1.84 1.27 1.07 1.87 2.81 1.33 3.5 1.01.11-.79.42-1.33.76-1.64-2.67-.31-5.47-1.38-5.47-6.15 0-1.36.46-2.46 1.22-3.33-.12-.31-.53-1.57.12-3.27 0 0 1-.33 3.3 1.27a11 11 0 0 1 6 0c2.3-1.6 3.3-1.27 3.3-1.27.65 1.7.24 2.96.12 3.27.76.87 1.22 1.97 1.22 3.33 0 4.78-2.81 5.83-5.49 6.14.43.38.81 1.13.81 2.29 0 1.65-.02 2.98-.02 3.39 0 .33.22.72.83.6C20.57 22.34 24 17.74 24 12.3 24 5.5 18.63 0 12 0Z" />
            </svg>
          </a>

          {user ? (
            <Link
              href="/dashboard"
              className="px-4 sm:px-5 py-2 rounded-full bg-white text-[#131313] text-[13px] font-semibold hover:bg-white/90 transition-all duration-300"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block px-4 py-2 rounded-full text-[13px] text-neutral-300 hover:text-white transition-colors duration-300"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 sm:px-5 py-2 rounded-full bg-white text-[#131313] text-[13px] font-semibold hover:bg-white/90 transition-all duration-300"
              >
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}