"use client";

/**
 * FocusTimerMonolith
 * The signature centerpiece of Focus Mode — a large radial timer.
 * A thin ring traces a 25‑minute work cycle around the clock face,
 * so the person always has a sense of pace without a ticking countdown.
 *
 * Props:
 *  - elapsed        {number}         elapsed seconds (frozen at its value while paused)
 *  - isActive       {boolean}        true while a session is actively running
 *  - isPaused       {boolean}        true when a session has time on it but isn't running
 *  - activeSubject  {string|null}    name of the subject currently bound to the timer
 */
export default function FocusTimerMonolith({ elapsed, isActive, isPaused, activeSubject }) {
  const formatTimer = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // The ring represents progress through a 25-minute focus cycle —
  // it laps back to 0 every 25 minutes, giving a sense of rhythm.
  const cycleSeconds = 25 * 60;
  const cycleProgress = isActive ? (elapsed % cycleSeconds) / cycleSeconds : 0;
  const laps = isActive ? Math.floor(elapsed / cycleSeconds) : 0;

  const radius = 47;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - cycleProgress);

  const display = formatTimer(elapsed);

  return (
    <div className="z-10 relative flex flex-col items-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-white/5 rounded-full blur-[110px]" />

      <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[520px] md:h-[520px] flex items-center justify-center">
        {/* Track + progress ring */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(71,71,71,0.28)"
            strokeWidth="0.6"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="white"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            style={{ filter: isActive ? "drop-shadow(0 0 6px rgba(255,255,255,0.65))" : "none" }}
          />
        </svg>

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <div
            className={`timer-glow font-[family-name:var(--font-space-grotesk)] font-bold leading-none tracking-tighter text-white select-none tabular-nums ${display.length > 5 ? "text-[3.6rem] sm:text-[4.8rem] md:text-[6rem]" : "text-[5.2rem] sm:text-[7rem] md:text-[9rem]"
              }`}
          >
            {display}
          </div>

          {/* Status line */}
          <div className="mt-5 flex items-center gap-2 font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-[0.2em] text-[#919191] min-h-[14px]">
            {isActive && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
            )}
            {isActive && activeSubject && (
              <span>
                Studying <span className="text-white">{activeSubject}</span>
              </span>
            )}
            {isPaused && activeSubject && (
              <span>
                Paused on <span className="text-white">{activeSubject}</span>
              </span>
            )}
            {!isActive && !isPaused && <span>Ready when you are</span>}
          </div>

          {isActive && laps > 0 && (
            <div className="mt-2 font-[family-name:var(--font-inter)] text-[9px] uppercase tracking-[0.2em] text-[#5f5f5f]">
              {laps} cycle{laps === 1 ? "" : "s"} complete
            </div>
          )}
        </div>
      </div>
    </div>
  );
}