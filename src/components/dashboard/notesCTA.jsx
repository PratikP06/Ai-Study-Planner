"use client";

import { useRouter } from "next/navigation";

export default function NotesCTA() {
    const router = useRouter();

    return (
        <div className="relative overflow-hidden bg-[#1c1b1b] rounded-2xl p-8 border border-white/5 group">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
            <span className="material-symbols-outlined text-neutral-500 text-2xl mb-4 block">
                auto_awesome
            </span>
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-white mb-2">
                Notes, written for you
            </h3>
            <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
                Give it a topic. Get structured notes back, ready to study from.
            </p>
            <button
                onClick={() => router.push("/dashboard/notes")}
                className="w-full bg-white text-[#131313] py-3.5 rounded-full font-[family-name:var(--font-inter)] font-semibold text-xs tracking-[0.15em] uppercase hover:bg-white/90 transition-all duration-300"
            >
                Make notes with AI
            </button>
        </div>
    );
}