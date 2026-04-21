"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";

export default function TodayFocusCard({ userId }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const fetchTodayFocus = async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from("sessions")
        .select("duration")
        .eq("user_id", userId)
        .gte("start_time", startOfDay.toISOString());

      const total = (data || []).reduce(
        (sum, s) => sum + (s.duration || 0),
        0
      );

      setSeconds(total);
    };

    fetchTodayFocus();
  }, [userId]);

  const format = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="bg-[#1c1b1b] rounded-2xl p-8 border border-white/5 glow-border-resting glow-border-hover transition-all duration-300">
      <span className="material-symbols-outlined text-neutral-500 text-2xl mb-4 block">timer</span>
      <div>
        <p className="text-4xl font-[family-name:var(--font-space-grotesk)] font-bold text-white">
          {format(seconds)}
        </p>
        <p className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-widest text-neutral-500 mt-1">
          Today&apos;s Focus
        </p>
      </div>
    </div>
  );
}
