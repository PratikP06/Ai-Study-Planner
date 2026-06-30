"use client";

export default function MonolithCTA({ user }) {
  return (
    <section className="py-32 sm:py-44 px-6 flex flex-col items-center bg-[#0e0e0e]">
      <div className="max-w-3xl w-full text-center space-y-12">
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.05]">
          Your next study session
          <br />
          could start in two minutes.
        </h2>

        <div className="h-16 w-px bg-gradient-to-b from-white/30 to-transparent mx-auto" />

        <div className="space-y-8">
          <p className="text-neutral-500 text-base sm:text-lg font-light max-w-md mx-auto">
            No setup beyond telling it what you're studying. The plan builds itself from there.
          </p>

          <a
            href={user ? "/dashboard" : "/signup"}
            className="inline-block bg-white text-[#131313] font-semibold px-10 py-5 rounded-full text-sm hover:bg-white/90 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.12)]"
          >
            {user ? "Go to dashboard" : "Start planning, free"}
          </a>
        </div>
      </div>
    </section>
  );
}