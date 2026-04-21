"use client";

// Priority badge styling (dark theme)
const PRIORITY_STYLES = {
  high: {
    badge: "bg-red-400/15 text-red-400 border border-red-400/20",
    dot: "bg-red-400",
  },
  medium: {
    badge: "bg-amber-400/15 text-amber-400 border border-amber-400/20",
    dot: "bg-amber-400",
  },
  low: {
    badge: "bg-emerald-400/15 text-emerald-400 border border-emerald-400/20",
    dot: "bg-emerald-400",
  },
};

// Rotating left-border accent colors per subject
const SUBJECT_BORDER_COLORS = [
  "border-l-white/30",
  "border-l-neutral-400",
  "border-l-white/20",
  "border-l-neutral-500",
  "border-l-white/25",
  "border-l-neutral-300",
];

/**
 * PlanCard
 * Renders one day's full schedule as a styled card.
 *
 * Props:
 *  - day        {number}  1-based day index
 *  - date       {string}  YYYY-MM-DD
 *  - totalHours {number}  Total study hours for this day
 *  - slots      {Array}   [{ subject, topic, startTime, endTime, durationMinutes, priority }]
 */
export default function PlanCard({ day, date, totalHours, slots = [] }) {
  // Format date nicely; fall back to "Day N" if date is missing/invalid
  let formattedDate = `Day ${day}`;
  if (date) {
    try {
      // Append T00:00:00 so it's treated as local midnight, not UTC midnight
      formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    } catch {
      /* keep fallback */
    }
  }

  // Assign a stable border color per unique subject name
  const uniqueSubjects = [...new Set(slots.map((s) => s.subject))];
  const subjectBorderColor = (subjectName) => {
    const idx = uniqueSubjects.indexOf(subjectName);
    return SUBJECT_BORDER_COLORS[idx % SUBJECT_BORDER_COLORS.length];
  };

  return (
    <div
      className="bg-[#1c1b1b] rounded-2xl p-6
        border border-white/5
        glow-border-resting glow-border-hover
        transition-all duration-300"
    >
      {/* ── Day Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <span className="font-[family-name:var(--font-inter)] text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Day {day}
          </span>
          <h3 className="text-base font-semibold text-white mt-0.5 leading-tight">
            {formattedDate}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
            {totalHours}h
          </span>
          <span className="text-[10px] text-neutral-500">{slots.length} slots</span>
        </div>
      </div>

      {/* ── Slots ── */}
      {slots.length > 0 ? (
        <ul className="space-y-3">
          {slots.map((slot, idx) => {
            const priorityStyle = PRIORITY_STYLES[slot.priority] ?? PRIORITY_STYLES.medium;

            return (
              <li
                key={idx}
                className={`
                  flex items-start gap-3 bg-[#0e0e0e]/70 rounded-xl p-4
                  border border-white/5 border-l-4 ${subjectBorderColor(slot.subject)}
                  hover:bg-[#0e0e0e] transition-colors duration-200
                `}
              >
                {/* Priority dot */}
                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${priorityStyle.dot}`} />

                <div className="flex-1 min-w-0">
                  {/* Time row */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-neutral-400 tabular-nums">
                      {slot.startTime} – {slot.endTime}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${priorityStyle.badge}`}
                    >
                      {slot.priority}
                    </span>
                  </div>

                  {/* Topic name */}
                  <p className="text-sm font-semibold text-white truncate leading-snug">
                    {slot.topic}
                  </p>

                  {/* Subject name */}
                  <p className="text-xs text-neutral-500 mt-0.5">{slot.subject}</p>
                </div>

                {/* Duration badge */}
                <span className="text-[11px] text-neutral-500 whitespace-nowrap pt-1 font-medium">
                  {slot.durationMinutes}min
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500 text-center py-4">No sessions scheduled</p>
      )}
    </div>
  );
}
