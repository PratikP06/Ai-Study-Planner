"use client";

export default function MonolithCTA({ user }) {
  return (
    <section className="py-48 px-8 flex flex-col items-center">
      <div className="max-w-4xl w-full text-center space-y-16">
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[0.9]">
          The workspace <br />you&apos;ve been waiting for.
        </h2>

        {/* Vertical gradient line */}
        <div className="h-20 w-[1px] bg-gradient-to-b from-white/20 to-transparent mx-auto" />

        <div className="space-y-10">
          <p className="text-neutral-400 text-lg md:text-xl font-light">
            Join the elite tier of digital scholars. Limited access now open for the ethereal beta.
          </p>

          {/* Gradient-bordered button */}
          <div className="inline-block p-[1px] bg-gradient-to-r from-white/10 via-white/50 to-white/10 rounded-full">
            <a
              href={user ? "/dashboard" : "/login"}
              className="block bg-neutral-950 text-white font-bold px-12 py-6 rounded-full text-sm uppercase tracking-widest hover:bg-neutral-900 transition-colors"
            >
              {user ? "Go to Dashboard" : "Request Invitation"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
