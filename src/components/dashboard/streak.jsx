"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import { Flame } from "lucide-react";

export default function FocusStreakCard({ userId }) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchStreak = async () => {
      const { data } = await supabase
        .from("sessions")
        .select("start_time")
        .eq("user_id", userId)
        .order("start_time", { ascending: false });

      if (!data || data.length === 0) return;

      const days = new Set(
        data.map((s) => new Date(s.start_time).toDateString())
      );

      let count = 0;
      let day = new Date();

      while (days.has(day.toDateString())) {
        count++;
        day.setDate(day.getDate() - 1);
      }

      setStreak(count);
    };

    fetchStreak();
  }, [userId]);

  return (
    <div className="bg-[#1c1b1b] rounded-2xl p-8 border border-white/5 glow-border-resting glow-border-hover transition-all duration-300">
      <div className="bg-white/5 p-3 rounded-full w-fit mb-4">
        <Flame size={22} className="text-white/80" />
      </div>
      <p className="text-4xl font-[family-name:var(--font-space-grotesk)] font-bold text-white">
        {streak} day{streak === 1 ? "" : "s"}
      </p>
      <p className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-widest text-neutral-500 mt-1">
        Current Streak
      </p>
    </div>
  );
}
