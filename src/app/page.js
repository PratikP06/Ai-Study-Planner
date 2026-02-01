export default function HomePage() {
  return (
    <main
      className="min-h-full px-6 py-16"
      style={{ backgroundColor: "#F0EEEA" }}
    >
      <section className="max-w-6xl mx-auto grid gap-12 md:grid-cols-2 items-center">
        
        {/* LEFT TEXT */}
        <div>
          <h1
            className="text-4xl md:text-5xl font-semibold leading-tight"
            style={{ color: "#3A4F4B" }}
          >
            Plan your studies.
            <br />
            Calmly. Intelligently.
          </h1>

          <p
            className="mt-5 text-lg leading-relaxed"
            style={{ color: "#6B7C78" }}
          >
            An AI-powered study planner that helps you organize subjects,
            track weak topics, and generate a realistic daily study plan
            based on your exams — without burnout.
          </p>

          <p
            className="mt-3 text-base"
            style={{ color: "#6B7C78" }}
          >
            No pressure. No overplanning. Just steady progress, every day.
          </p>

          <div className="mt-8 flex gap-4 flex-wrap">
            <a
              href="/dashboard"
              className="px-6 py-3 rounded-lg font-medium transition hover:opacity-90"
              style={{
                backgroundColor: "#97B3AE",
                color: "#FFFFFF",
              }}
            >
              Get Started
            </a>

            <a
              href="/planner"
              className="px-6 py-3 rounded-lg font-medium border transition hover:bg-white/40"
              style={{
                borderColor: "#D6CBBF",
                color: "#3A4F4B",
              }}
            >
              View Planner
            </a>
          </div>
        </div>

        {/* RIGHT MOCK CARD */}
        <div className="relative flex justify-center md:justify-end">
          <div
            className="w-full max-w-sm rounded-2xl shadow-lg p-6"
            style={{ backgroundColor: "#F0DDD6" }}
          >
            <div
              className="h-3 w-12 rounded mb-4"
              style={{ backgroundColor: "#97B3AE" }}
            />

            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: "#3A4F4B" }}
            >
              Today’s Study Plan
            </h3>

            <ul
              className="text-sm space-y-3"
              style={{ color: "#5F6F6B" }}
            >
              <li>🕘 9:00 – 10:00 · DSA (Weak topics)</li>
              <li>☕ 10:00 – 10:10 · Break</li>
              <li>🕙 10:10 – 11:00 · DBMS Revision</li>
              <li>🧠 Focused, realistic pacing</li>
            </ul>

            <div
              className="mt-5 h-2 rounded"
              style={{ backgroundColor: "#F2C3B9" }}
            />
          </div>
        </div>
      </section>

      {/* SCROLL TEST (optional, remove later) */}
      <div className="h-[400px]" />
    </main>
  );
}
