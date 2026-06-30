"use client";

export default function Hero({ user }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-24 px-6 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-white/[0.04] blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-neutral-400 font-[family-name:var(--font-inter)] text-[11px] uppercase tracking-[0.25em] opacity-0 animate-[fadeUp_0.8s_ease_forwards]"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
          Built for students, not teams
        </div>

        <h1
          className="font-[family-name:var(--font-space-grotesk)] text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] opacity-0 animate-[fadeUp_0.8s_ease_forwards]"
          style={{ animationDelay: "0.2s" }}
        >
          Your semester,
          <br />
          finally in one place.
        </h1>

        <p
          className="max-w-xl mx-auto text-[#c6c6c6] text-base sm:text-lg font-light leading-relaxed opacity-0 animate-[fadeUp_0.8s_ease_forwards]"
          style={{ animationDelay: "0.3s" }}
        >
          Flow State is a quiet workspace for planning, focus, and notes —
          built so you stop juggling five apps to study for one exam.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 opacity-0 animate-[fadeUp_0.8s_ease_forwards]"
          style={{ animationDelay: "0.4s" }}
        >
          <a
            href={user ? "/dashboard" : "/signup"}
            className="bg-white text-[#131313] font-semibold px-8 py-4 rounded-full text-sm hover:bg-white/90 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.12)]"
          >
            {user ? "Go to dashboard" : "Start planning, free"}
          </a>
          <a
            href="#features"
            className="px-8 py-4 rounded-full border border-white/10 text-white text-sm hover:bg-white/5 transition-all duration-300"
          >
            See how it works
          </a>
        </div>
      </div>

      {/* Dashboard preview mockup */}
      <div
        className="relative z-10 mt-20 w-full max-w-4xl opacity-0 animate-[fadeUp_1s_ease_forwards]"
        style={{ animationDelay: "0.55s" }}
      >
        <div className="rounded-2xl border border-white/10 bg-[#1c1b1b]/60 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="text-[11px] text-neutral-600 font-[family-name:var(--font-inter)]">
                flowstate.app/dashboard
              </div>
            </div>
          </div>

          {/* Mock dashboard content */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Today's plan
              </div>
              {[
                { subject: "Data Structures", topic: "Binary Trees", time: "45 min" },
                { subject: "Operating Systems", topic: "Deadlock Handling", time: "60 min" },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-white/20" />
                    <div>
                      <div className="text-sm text-white font-medium">{row.subject}</div>
                      <div className="text-xs text-neutral-500">{row.topic}</div>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500">{row.time}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 flex flex-col justify-between">
              <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Focus streak
              </div>
              <div className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold text-white">
                12<span className="text-base text-neutral-500 font-normal"> days</span>
              </div>
              <div className="text-xs text-neutral-500">Longest yet</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}