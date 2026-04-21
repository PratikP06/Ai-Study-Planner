"use client";

import { useRouter } from "next/navigation";

export default function StartFocusCard() {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden bg-[#2a2a2a] rounded-2xl p-8 border border-white/5 group glow-border-resting">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
      <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-white mb-4">
        Deep Focus
      </h3>
      <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
        Activate focus mode to eliminate distractions and start studying.
      </p>
      <button
        onClick={() => router.push("/dashboard/focus")}
        className="w-full bg-white text-[#1a1c1c] py-4 rounded-full font-[family-name:var(--font-inter)] font-bold text-xs tracking-[0.2em] uppercase hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all"
      >
        Enter Focus Mode
      </button>
    </div>
  );
}
