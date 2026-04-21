"use client";

/**
 * FocusContextCards
 * Stitch-style contextual bento widgets below the timer:
 *  - Active Task card (shows the active subject)
 *  - Daily Progress card (shows today's hours)
 *  - Subject Selector card (pick a subject to start)
 *
 * Props:
 *  - subjects        {Array}   list of subject objects
 *  - activeSubject   {object|null}  currently active subject
 *  - todayHours      {number}  total study hours today
 *  - onSelectSubject {fn}      called with subject.id to start a session
 */
export default function FocusContextCards({ subjects, activeSubject, todaySeconds, onSelectSubject }) {
  const totalMinutes = Math.floor(todaySeconds / 60); // ✅ seconds → minutes
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  
  let timeDisplay = "";
  if (h > 0) {
    timeDisplay = m > 0 ? `${h}h ${m}m` : `${h}h`;
  } else {
    timeDisplay = `${m}m`;
  }

  return (
    <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mt-32 mb-24 px-4">
      {/* Active Task Card */}
      <div className="bg-[#1c1b1b]/40 monolith-blur ghost-border p-8 rounded-2xl flex flex-col justify-between group hover:border-white/40 transition-all duration-500 min-h-[240px]">
        <div>
          <span className="font-[family-name:var(--font-inter)] uppercase tracking-[0.2em] text-[#919191] text-xs block mb-6">Active Task</span>
          <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-white mb-2">
            {activeSubject?.name || "No Subject Selected"}
          </h3>
          <p className="text-[#c6c6c6] font-light">
            {activeSubject 
              ? "Focus session in progress. Stay concentrated."
              : "Select a subject below to begin studying."}
          </p>
        </div>
        
      </div>

      {/* Daily Progress Card */}
      <div className="bg-[#1c1b1b]/40 monolith-blur ghost-border p-8 rounded-2xl flex flex-col group hover:border-white/40 transition-all duration-500 min-h-[240px]">
        <span className="font-[family-name:var(--font-inter)] uppercase tracking-[0.2em] text-[#919191] text-xs block mb-6">Daily Progress</span>
        <div className="flex-grow flex items-end justify-between">
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold text-white">{timeDisplay}</span>
            <span className="font-[family-name:var(--font-inter)] uppercase tracking-widest text-[10px] text-[#919191]">Studied Today</span>
          </div>
          {/* Mini bar chart */}
          <div className="flex items-baseline space-x-1">
            <div className="w-2 h-12 bg-white/10 rounded-full" />
            <div className="w-2 h-16 bg-white/10 rounded-full" />
            <div className="w-2 h-20 bg-white rounded-full" />
            <div className="w-2 h-14 bg-white/10 rounded-full" />
            <div className="w-2 h-[72px] bg-white/10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Subject Selector Card */}
      <div className="bg-[#1c1b1b]/40 monolith-blur ghost-border p-8 rounded-2xl group hover:border-white/40 transition-all duration-500 min-h-[240px] flex flex-col">
        <span className="font-[family-name:var(--font-inter)] uppercase tracking-[0.2em] text-[#919191] text-xs block mb-6">Select Subject</span>
        <div className="flex-grow space-y-3 overflow-y-auto">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onSelectSubject(sub.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                activeSubject?.id === sub.id
                  ? "bg-white text-[#1a1c1c]"
                  : "bg-white/5 text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              {sub.name}
            </button>
          ))}
          {subjects.length === 0 && (
            <p className="text-neutral-500 text-sm">No subjects available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
