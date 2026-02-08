"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";

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
        data.map((s) =>
          new Date(s.start_time).toDateString()
        )
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
    <div className="rounded-xl p-6 bg-white shadow-sm">
      <p className="text-sm text-gray-500">Focus streak</p>
      <h2 className="text-2xl font-semibold mt-2">
        🔥 {streak} day{streak === 1 ? "" : "s"}
      </h2>
    </div>
  );
}
