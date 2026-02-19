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
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-6
                 rounded-2xl
                 bg-[#F6F3ED]
                 shadow-[0_10px_30px_rgba(0,0,0,0.05)]
                 px-6 py-5 transition-all duration-300"
    >
            <div className="space-y-2">
        <h3 className="font-semibold text-[#3A4F4B] text-lg">
          {subject.name}
        </h3>

        <p className="text-sm text-[#6B7C78] flex items-center gap-2">
          <FaStopwatch className="opacity-70 text-[#97B3AE]" />
          Today:
          <span className="font-medium text-[#3A4F4B]">
            {formatTime(displayTime)}
          </span>
        </p>
      </div>

            <div className="flex justify-end">
        {isActive ? (
          <button
            onClick={stopSession}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                       bg-[#F2C3B9]/60
                       text-[#3A4F4B]
                       font-medium text-sm
                       hover:bg-[#F2C3B9]/80
                       transition-all duration-200"
          >
            <FaPause size={14} />
            
          </button>
        ) : (
          <button
            onClick={() => startSession(subject.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                       bg-[#97B3AE]/40
                       text-[#3A4F4B]
                       font-medium text-sm
                       hover:bg-[#97B3AE]/60
                       transition-all duration-200"
          >
            <FaPlay size={14} />
         
          </button>
        )}
      </div>
    </div>
  );
}
