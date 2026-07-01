"use client";

import { FaPlay, FaPause } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

/**
 * FocusControlPanel
 * Reset, and the single Play/Pause action that drives whichever subject
 * is currently bound to the timer (see `focus/page.jsx` for the binding logic).
 *
 * Props:
 *  - isActive   {boolean}
 *  - isPaused   {boolean}
 *  - canStart   {boolean}  false when there's no subject to start a session for
 *  - onToggle   {fn}       starts, pauses, or resumes the timer
 *  - onReset    {fn}       ends the session and zeroes the clock
 */
export default function FocusControlPanel({ isActive, isPaused, canStart, onToggle, onReset }) {
  const playDisabled = !isActive && !canStart;

  return (
    <div className="z-10 flex items-center justify-center gap-10 sm:gap-14 mt-14">
      {/* Reset */}
      <button
        onClick={onReset}
        disabled={!isActive && !isPaused}
        className="group flex flex-col items-center space-y-3 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white transition-all duration-300 group-enabled:group-hover:bg-white group-enabled:group-hover:text-black">
          <FiRefreshCw size={20} />
        </div>
        <span className="font-[family-name:var(--font-inter)] uppercase tracking-widest text-[10px] text-[#919191] transition-colors group-enabled:group-hover:text-white">
          Reset
        </span>
      </button>

      {/* Play / Pause — the primary action */}
      <button
        onClick={onToggle}
        disabled={playDisabled}
        className="group flex flex-col items-center space-y-4 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <div className="w-24 h-24 rounded-full bg-white text-[#1a1c1c] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all duration-300 group-enabled:group-hover:scale-110 group-enabled:active:scale-95">
          {isActive ? <FaPause size={30} /> : <FaPlay size={30} className="ml-1" />}
        </div>
        <span className="font-[family-name:var(--font-inter)] uppercase tracking-widest text-[10px] text-white">
          {isActive ? "Pause Session" : isPaused ? "Resume Session" : "Begin Session"}
        </span>
      </button>

      {/* Spacer to keep the play button visually centered */}
      <div className="w-14" aria-hidden="true" />
    </div>
  );
}