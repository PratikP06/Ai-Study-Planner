"use client";

import PlanCard from "./PlanCard";
import { BookOpen, Clock, Calendar, TrendingUp } from "lucide-react";

/**
 * PlanTimetable
 * Summary stats bar + grid of PlanCards for each day in the plan.
 *
 * Props:
 *  - plan {object} Full plan JSON returned by /api/generate-plan:
 *    { totalDays, hoursPerDay, summary, days: [{ day, date, totalHours, slots }] }
 */
export default function PlanTimetable({ plan }) {
  if (!plan?.days?.length) return null;

  const totalSlots = plan.days.reduce((acc, d) => acc + (d.slots?.length || 0), 0);
  const allSubjects = [
    ...new Set(plan.days.flatMap((d) => (d.slots || []).map((s) => s.subject))),
  ];
  const highPriorityCount = plan.days.flatMap((d) => d.slots || []).filter(
    (s) => s.priority === "high"
  ).length;

  return (
    <div className="space-y-6">
      {/* ── Summary Stats + AI Summary ── */}
      <div className="bg-[#1c1b1b] rounded-2xl p-6 border border-white/5 glow-border-resting">
        {/* AI-generated plan summary */}
        {plan.summary && (
          <blockquote className="text-sm text-neutral-300 leading-relaxed mb-5 italic border-l-4 border-white/20 pl-4">
            {plan.summary}
          </blockquote>
        )}

        {/* Stats chips */}
        <div className="flex flex-wrap gap-3">
          <StatChip icon={Calendar} label={`${plan.totalDays} days`} />
          <StatChip icon={Clock} label={`~${plan.hoursPerDay}h / day`} />
          <StatChip icon={BookOpen} label={`${totalSlots} study slots`} />
          <StatChip icon={TrendingUp} label={`${highPriorityCount} high-priority sessions`} />
        </div>

        {/* Subject legend */}
        {allSubjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            <span className="text-xs text-neutral-500 font-medium self-center">Subjects:</span>
            {allSubjects.map((sub) => (
              <span
                key={sub}
                className="px-3 py-1 text-xs rounded-full bg-white/5 text-neutral-300 font-medium"
              >
                {sub}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Day Cards Grid ── */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plan.days.map((d) => (
          <PlanCard
            key={d.day}
            day={d.day}
            date={d.date}
            slots={d.slots || []}
            totalHours={d.totalHours}
          />
        ))}
      </div>
    </div>
  );
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function StatChip({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-sm text-neutral-400">
      <Icon size={13} className="text-white/40 flex-shrink-0" />
      <span className="font-medium">{label}</span>
    </div>
  );
}
