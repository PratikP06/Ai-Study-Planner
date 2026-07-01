"use client";

/**
 * FocusContextCards
 * Bento grid beneath the timer:
 *  - Active Task    → what the timer is bound to right now
 *  - Daily Progress → today's total + a 7-day activity trail + today's plan completion
 *  - Study Queue    → subjects still owed time today, tap one to bind + start the timer
 *
 * Props:
 *  - subjects        {Array}   subjects still needing time today (or all, if no plan)
 *  - subjectMeta      {Object}  subjectId → { remainingSlots, totalMinutes, nextTopic }
 *  - examMeta         {Object}  subjectId → daysLeft (nearest upcoming exam)
 *  - activeSubject    {object|null}  subject currently bound to the timer
 *  - isActive         {boolean} timer actively running
 *  - todaySeconds      {number}
 *  - weeklyData        {Array}  7 entries: { label, minutes, isToday }
 *  - remainingToday    {Object} { hasPlan, remaining } sessions left today
 *  - onSelectSubject   {fn}     called with subject.id to bind/start/pause/resume
 */
export default function FocusContextCards({
  subjects,
  subjectMeta = {},

  activeSubject,
  isActive,
  todaySeconds,
  weeklyData = [],
  remainingToday = { hasPlan: false, remaining: 0 },
  onSelectSubject,
}) {
  const totalMinutes = Math.floor(todaySeconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  let timeDisplay = "";
  if (h > 0) {
    timeDisplay = m > 0 ? `${h}h ${m}m` : `${h}h`;
  } else {
    timeDisplay = `${m}m`;
  }

  const maxMinutes = Math.max(1, ...weeklyData.map((d) => d.minutes));

  return (
    <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-24 mb-24 px-4">
      {/* ── Active Task ── */}
      <div className="bg-[#1c1b1b]/40 monolith-blur ghost-border p-8 rounded-2xl flex flex-col justify-between hover:border-white/40 transition-all duration-500 min-h-[240px]">
        <div>
          <span className="font-[family-name:var(--font-inter)] uppercase tracking-[0.2em] text-[#919191] text-xs flex items-center gap-2 mb-6">
            Active Task
            {isActive && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
            )}
          </span>
          <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-white mb-2 truncate">
            {activeSubject?.name || "No Subject Selected"}
          </h3>
          <p className="text-[#c6c6c6] font-light text-sm leading-relaxed">
            {activeSubject
              ? subjectMeta[activeSubject.id]?.nextTopic
                ? `Up next: ${subjectMeta[activeSubject.id].nextTopic}`
                : "Focus session in progress. Stay concentrated."
              : "Pick a subject from the queue to bind the timer and begin."}
          </p>
        </div>

        {activeSubject && subjectMeta[activeSubject.id]?.remainingSlots > 0 && (
          <div className="mt-6 flex items-center gap-2 text-xs text-neutral-500">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">
              {subjectMeta[activeSubject.id].remainingSlots} session
              {subjectMeta[activeSubject.id].remainingSlots === 1 ? "" : "s"} left today
            </span>
          </div>
        )}
      </div>

      {/* ── Daily Progress ── */}
      <div className="bg-[#1c1b1b]/40 monolith-blur ghost-border p-8 rounded-2xl flex flex-col hover:border-white/40 transition-all duration-500 min-h-[240px]">
        <span className="font-[family-name:var(--font-inter)] uppercase tracking-[0.2em] text-[#919191] text-xs block mb-6">
          Daily Progress
        </span>

        <div className="flex items-end justify-between mb-6">
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold text-white">{timeDisplay}</span>
            <span className="font-[family-name:var(--font-inter)] uppercase tracking-widest text-[10px] text-[#919191]">Studied Today</span>
          </div>

          {/* 7-day activity trail */}
          <div className="flex items-end gap-1.5 h-16">
            {weeklyData.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-2 rounded-full transition-all duration-500 ${day.isToday ? "bg-white" : day.minutes > 0 ? "bg-white/25" : "bg-white/10"
                    }`}
                  style={{ height: `${Math.max(6, (day.minutes / maxMinutes) * 56)}px` }}
                />
                <span className={`text-[9px] font-[family-name:var(--font-inter)] ${day.isToday ? "text-white" : "text-[#5f5f5f]"}`}>
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {remainingToday.hasPlan && (
          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-neutral-500 font-[family-name:var(--font-inter)] uppercase tracking-widest text-[10px]">
              Today&apos;s plan
            </span>
            <span className="text-white text-xs font-medium">
              {remainingToday.remaining > 0
                ? `${remainingToday.remaining} session${remainingToday.remaining === 1 ? "" : "s"} left`
                : "All wrapped up"}
            </span>
          </div>
        )}
      </div>

      {/* ── Study Queue ── */}
      <div className="bg-[#1c1b1b]/40 monolith-blur ghost-border p-8 rounded-2xl hover:border-white/40 transition-all duration-500 min-h-[240px] flex flex-col">
        <span className="font-[family-name:var(--font-inter)] uppercase tracking-[0.2em] text-[#919191] text-xs block mb-6">
          Study Queue
        </span>
        <div className="flex-grow space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
          {subjects.map((sub) => {
            const isThisActive = activeSubject?.id === sub.id;
            const meta = subjectMeta[sub.id];


            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubject(sub.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 border ${isThisActive
                  ? "bg-white text-[#1a1c1c] border-white"
                  : "bg-white/5 text-white hover:bg-white/10 border-white/5"
                  }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium truncate">{sub.name}</span>
                  {isThisActive && isActive && (
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a1c1c] opacity-60" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1a1c1c]" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {subjects.length === 0 && (
            <p className="text-neutral-500 text-sm">No subjects available.</p>
          )}
        </div>
      </div>
    </div>
  );
}