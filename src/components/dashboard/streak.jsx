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
    <div className="bg-[#F6F3ED] rounded-3xl p-6 border border-[#D6CBBF] shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
      <p className="text-sm text-[#6B7C78] mb-4">Focus streak</p>

      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-[#D2E0D3]/60">
          <Flame size={22} className="text-[#3A4F4B]" />
        </div>

        <h2 className="text-3xl font-semibold text-[#3A4F4B]">
          {streak} day{streak === 1 ? "" : "s"}
        </h2>
      </div>
    </div>
  );
}
