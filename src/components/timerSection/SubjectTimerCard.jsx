"use client";

import { FaPlay, FaPause, FaStopwatch } from "react-icons/fa";

export default function SubjectTimerCard({
  subject,
  activeSession,
  elapsed,
  startSession,
  stopSession,
  todayTotal = 0,
}) {
  const isActive = activeSession?.subject_id === subject.id;

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const displayTime = isActive
    ? todayTotal + elapsed
    : todayTotal;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-6
                 rounded-xl
                 bg-[#0e0e0e]
                 border ${isActive ? "border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.04)]" : "border-white/5"}
                 px-6 py-5 transition-all duration-300`}
    >
      {/* Subject info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-white text-lg">
          {subject.name}
        </h3>

        <p className="text-sm text-neutral-500 flex items-center gap-2">
          <FaStopwatch className="opacity-70 text-white/30" />
          Today:
          <span className="font-medium text-white">
            {formatTime(displayTime)}
          </span>
        </p>
      </div>

      {/* Play/Pause */}
      <div className="flex justify-end">
        {isActive ? (
          <button
            onClick={stopSession}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full
                       bg-red-400/15 border border-red-400/20
                       text-red-400
                       font-medium text-sm
                       hover:bg-red-400/25
                       transition-all duration-200"
          >
            <FaPause size={14} />
            
          </button>
        ) : (
          <button
            onClick={() => startSession(subject.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full
                       bg-white/10 border border-white/10
                       text-white
                       font-medium text-sm
                       hover:bg-white/20 hover:shadow-[0_0_12px_rgba(255,255,255,0.06)]
                       transition-all duration-200"
          >
            <FaPlay size={14} />
         
          </button>
        )}
      </div>
    </div>
  );
}
