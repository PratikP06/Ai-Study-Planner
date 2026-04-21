"use client";

import Image from "next/image";

export default function FeatureGrid() {
  return (
    <section className="bg-[#1c1b1b] py-32 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-xl space-y-4">
            <div className="font-[family-name:var(--font-inter)] text-xs tracking-[0.4em] uppercase text-neutral-500">
              Infrastructure
            </div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Tools for the Modern Scholar.
            </h2>
          </div>
          <p className="max-w-xs text-neutral-400 font-light text-sm leading-relaxed">
            A suite of meticulously engineered components designed to eliminate friction from the learning process.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Large card — Adaptive Study Cycles */}
          <div className="md:col-span-8 bg-[#201f1f] rounded-2xl p-10 glow-border-resting glow-border-active border border-transparent transition-all duration-500 relative overflow-hidden group">
            <div className="relative z-10 space-y-12">
              <span className="material-symbols-outlined text-white text-4xl font-light">auto_awesome_motion</span>
              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-white tracking-tight">Adaptive Study Cycles</h3>
                <p className="text-[#c6c6c6] max-w-md font-light leading-relaxed">
                  Our proprietary algorithm learns your peak focus hours and structures your day around high-leverage intellectual tasks.
                </p>
              </div>
            </div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-3xl group-hover:bg-white/[0.05] transition-colors" />
          </div>

          {/* Small card — Deep Logic */}
          <div className="md:col-span-4 bg-[#131313] rounded-2xl p-10 glow-border-resting glow-border-active border border-transparent transition-all duration-500 flex flex-col justify-between group min-h-[280px]">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
            <div className="space-y-4">
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-white tracking-tight">Deep Logic</h3>
              <p className="text-neutral-500 text-sm font-light">Mathematical modeling of syllabus retention rates.</p>
            </div>
          </div>

          {/* Small card — Focus Anchors */}
          <div className="md:col-span-4 bg-[#131313] rounded-2xl p-10 glow-border-resting glow-border-active border border-transparent transition-all duration-500 flex flex-col justify-between group min-h-[280px]">
            <span className="material-symbols-outlined text-white text-3xl">filter_tilt_shift</span>
            <div className="space-y-4">
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-white tracking-tight">Focus Anchors</h3>
              <p className="text-neutral-500 text-sm font-light">Spatial audio environments tuned for neuro-concentration.</p>
            </div>
          </div>

          {/* Large image card — Cognitive Harmony */}
          <div className="md:col-span-8 bg-[#2a2a2a] rounded-2xl overflow-hidden glow-border-resting glow-border-active border border-transparent transition-all duration-500 relative group min-h-[400px]">
            <Image
              alt="Minimal workspace"
              src="/workspace-hero.png"
              fill
              className="object-cover opacity-30 grayscale group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent opacity-80" />
            <div className="absolute bottom-0 left-0 p-10">
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-white tracking-tight mb-2">Cognitive Harmony</h3>
              <p className="text-neutral-400 font-light max-w-sm">A visual interface that mirrors the orderly structure of your thoughts.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
