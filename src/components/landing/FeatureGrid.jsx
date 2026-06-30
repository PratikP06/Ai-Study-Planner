"use client";

export default function FeatureGrid() {
  return (
    <section id="features" className="py-28 sm:py-36 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 sm:mb-20 gap-8">
          <div className="max-w-xl space-y-4">
            <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
              What's inside
            </div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
              Everything a semester needs. Nothing it doesn't.
            </h2>
          </div>
          <p className="max-w-xs text-neutral-500 text-sm font-light leading-relaxed">
            Twelve tools, one interface, zero context-switching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Large — AI Planner */}
          <div className="md:col-span-8 bg-[#1c1b1b] rounded-2xl p-8 sm:p-10 border border-white/5 hover:border-white/10 transition-all duration-500 relative overflow-hidden group min-h-[260px] flex flex-col justify-between">
            <span className="material-symbols-outlined text-white text-3xl">auto_awesome</span>
            <div className="space-y-3">
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-white">
                AI study planner
              </h3>
              <p className="text-neutral-500 text-sm font-light leading-relaxed max-w-sm">
                Tell it what's due and what you're weak at. It builds a day-by-day schedule
                weighted toward what actually needs the time.
              </p>
            </div>
            <div className="absolute bottom-[-15%] right-[-10%] w-[300px] h-[300px] bg-white/[0.02] rounded-full blur-3xl group-hover:bg-white/[0.04] transition-colors" />
          </div>

          {/* Small — Focus timer */}
          <div className="md:col-span-4 bg-[#1c1b1b] rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all duration-500 flex flex-col justify-between min-h-[260px]">
            <span className="material-symbols-outlined text-white text-3xl">timer</span>
            <div className="space-y-2">
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-white">
                Focus sessions
              </h3>
              <p className="text-neutral-500 text-sm font-light">
                One subject, one timer, nothing else on screen.
              </p>
            </div>
          </div>

          {/* Three small features */}
          {[
            { icon: "calendar_month", title: "Calendar & exams", body: "Every deadline in one view, weighted by urgency." },
            { icon: "description", title: "Notes", body: "Structured, topic-linked, generated or written by you." },
            { icon: "bar_chart", title: "Analytics", body: "See where your hours actually went this week." },
          ].map((f, i) => (
            <div
              key={i}
              className="md:col-span-4 bg-[#1c1b1b] rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all duration-500 flex flex-col justify-between min-h-[220px]"
            >
              <span className="material-symbols-outlined text-white text-3xl">{f.icon}</span>
              <div className="space-y-2">
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-white">
                  {f.title}
                </h3>
                <p className="text-neutral-500 text-sm font-light">{f.body}</p>
              </div>
            </div>
          ))}

          {/* Large — Progress tracking */}
          <div className="md:col-span-8 bg-[#1c1b1b] rounded-2xl p-8 sm:p-10 border border-white/5 hover:border-white/10 transition-all duration-500 relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
            <span className="material-symbols-outlined text-white text-3xl">trending_up</span>
            <div className="space-y-3">
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-white">
                Progress that compounds
              </h3>
              <p className="text-neutral-500 text-sm font-light leading-relaxed max-w-sm">
                Daily goals, weekly views, and a streak that tells the truth about your consistency.
              </p>
            </div>
          </div>
        </div>

        {/* Secondary feature row — smaller, list-style */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: "task_alt", label: "Task manager" },
            { icon: "bolt", label: "Quick capture" },
            { icon: "notifications", label: "Smart reminders" },
            { icon: "repeat", label: "Habit tracker" },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-[#1c1b1b]/50 rounded-xl p-5 border border-white/5 flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-neutral-400 text-xl">{f.icon}</span>
              <span className="text-sm text-neutral-300 font-light">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}