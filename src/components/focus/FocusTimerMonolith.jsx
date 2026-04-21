"use client";

/**
 * FocusTimerMonolith
 * Renders the massive Stitch-style timer display with glow and progress bar.
 *
 * Props:
 *  - elapsed       {number}  elapsed seconds
 *  - isActive      {boolean} whether a session is running
 *  - activeSubject {string}  name of the currently active subject
 */
export default function FocusTimerMonolith({ elapsed, isActive, activeSubject }) {
  const formatTimer = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Calculate a faux progress bar (cycles every 25 min for visual effect)
  const cycleSeconds = 25 * 60;
  const progressPercent = isActive
    ? Math.min((elapsed / cycleSeconds) * 100, 100)
    : 0;

  return (
    <div className="z-10 relative group">
      {/* Glow effect behind timer */}
      <div className="absolute inset-0 bg-white/5 rounded-full blur-[100px] group-hover:bg-white/10 transition-all duration-700" />

      <div className="relative flex flex-col items-center">
        {/* The massive timer */}
        <div className="timer-glow font-[family-name:var(--font-space-grotesk)] font-bold text-[10rem] sm:text-[12rem] md:text-[18rem] leading-none tracking-tighter text-white select-none">
          {formatTimer(elapsed)}
        </div>

        {/* Progress Indicator */}
        <div className="w-full max-w-md h-[2px] bg-[#474747]/30 mt-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Active subject label */}
        {isActive && activeSubject && (
          <div className="mt-6 font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-[0.2em] text-[#919191]">
            Studying: <span className="text-white">{activeSubject}</span>
          </div>
        )}
      </div>
    </div>
  );
}
