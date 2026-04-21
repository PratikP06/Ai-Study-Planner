"use client";

import { FaPlay, FaPause } from "react-icons/fa";
import { FiRefreshCw, FiSettings } from "react-icons/fi";

/**
 * FocusControlPanel
 * Stitch-style minimal control actions: Reset, Play/Pause, Settings
 *
 * Props:
 *  - isActive     {boolean}
 *  - onStart      {fn}
 *  - onStop       {fn}
 *  - onReset      {fn}       resets the elapsed to 0 (stop session)
 *  - onSettings   {fn|null}  optional settings callback
 */
export default function FocusControlPanel({ isActive, onStart, onStop, onReset }) {
  return (
    <div className="z-10 flex items-center justify-center space-x-12 mt-24">
      {/* Reset */}
      <button
        onClick={onReset}
        className="group flex flex-col items-center space-y-4"
      >
        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black text-white transition-all duration-300">
          <FiRefreshCw size={24} />
        </div>
        <span className="font-[family-name:var(--font-inter)] uppercase tracking-widest text-[10px] text-[#919191] group-hover:text-white transition-colors">
          Reset
        </span>
      </button>

      {/* Play / Pause — the large center button */}
      {isActive ? (
        <button
          onClick={onStop}
          className="group flex flex-col items-center space-y-4"
        >
          <div className="w-24 h-24 rounded-full bg-white text-[#1a1c1c] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.15)] group-hover:scale-110 active:scale-95 transition-all duration-300">
            <FaPause size={32} />
          </div>
          <span className="font-[family-name:var(--font-inter)] uppercase tracking-widest text-[10px] text-white">
            Pause Session
          </span>
        </button>
      ) : (
        <button
          onClick={onStart}
          className="group flex flex-col items-center space-y-4"
        >
          <div className="w-24 h-24 rounded-full bg-white text-[#1a1c1c] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.15)] group-hover:scale-110 active:scale-95 transition-all duration-300">
            <FaPlay size={32} className="ml-1" />
          </div>
          <span className="font-[family-name:var(--font-inter)] uppercase tracking-widest text-[10px] text-white">
            Begin Session
          </span>
        </button>
      )}


    </div>
  );
}
