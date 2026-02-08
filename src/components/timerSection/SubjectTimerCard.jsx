"use client";

import { FaPlay, FaPause, FaStopwatch } from "react-icons/fa";

export default function SubjectTimerCard({
  subject,
  activeSession,
  elapsed,
  startSession,
  stopSession,
  todayTotal = 0, // seconds
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
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4
                 rounded-xl border border-[#D6D1C8]
                 bg-[#F6F3ED] px-5 py-4"
    >
      {/* Left */}
      <div className="space-y-1">
        <h3 className="font-semibold text-[#3A4F4B] text-base sm:text-lg">
          {subject.name}
        </h3>

        <p className="text-sm text-[#6B7C78] flex items-center gap-2">
          <FaStopwatch className="opacity-70" />
          Today:{" "}
          <span className="font-medium">
            {formatTime(displayTime)}
          </span>
        </p>
      </div>

      {/* Right */}
      <div className="self-end sm:self-auto">
        {isActive ? (
          <button
            onClick={stopSession}
            className="flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-red-500 text-white text-sm font-medium
                       hover:opacity-90 transition"
          >
            <FaPause />
            Pause
          </button>
        ) : (
          <button
            onClick={() => startSession(subject.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-green-500 text-white text-sm font-medium
                       hover:opacity-90 transition"
          >
            <FaPlay />
            Start
          </button>
        )}
      </div>
    </div>
  );
}
