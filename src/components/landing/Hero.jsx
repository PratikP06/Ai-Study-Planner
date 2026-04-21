"use client";

export default function Hero({ user }) {
  return (
    <section className="relative min-h-[921px] flex flex-col items-center justify-center pt-24 pb-32 px-6">
      {/* Ambient glow orb */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl w-full text-center space-y-12">
        {/* Eyebrow pill */}
        <div className="inline-block px-4 py-1 rounded-full border border-[#474747]/30 text-neutral-400 font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-[0.3em] mb-4">
          The Next Evolution of Focus
        </div>

        {/* Massive headline */}
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-6xl md:text-8xl font-bold tracking-tight text-white text-glow-headline leading-[0.95]">
          Architecture <br />of Intellect.
        </h1>

        {/* Subtext */}
        <p className="max-w-2xl mx-auto text-[#c6c6c6] text-lg md:text-xl font-light leading-relaxed">
          Transcend traditional task management. Experience a workspace designed for deep focus, where every pixel serves your cognitive clarity.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
          <a
            href={user ? "/dashboard" : "/signup"}
            className="primary-cta-gradient text-[#1a1c1c] font-bold px-10 py-5 rounded-full text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
          >
            {user ? "Go to Dashboard" : "Begin Journey"}
          </a>

          <a
            href="/dashboard/ai"
            className="px-10 py-5 rounded-full border border-white/10 text-white font-medium text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            Explore Methodology
          </a>
        </div>
      </div>

      {/* Asymmetric floating element — desktop only */}
      <div className="absolute bottom-10 right-[10%] hidden lg:block">
        <div className="glass-panel border border-white/10 p-8 rounded-2xl shadow-2xl space-y-4 max-w-xs rotate-3">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">bolt</span>
            </div>
            <div className="font-[family-name:var(--font-space-grotesk)] font-bold text-white tracking-tight">Active Sessions</div>
          </div>
          <div className="h-[2px] w-full bg-white/5" />
          <div className="text-neutral-500 font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-widest">Efficiency</div>
          <div className="text-3xl font-[family-name:var(--font-space-grotesk)] font-bold text-white">98.4%</div>
        </div>
      </div>
    </section>
  );
}
