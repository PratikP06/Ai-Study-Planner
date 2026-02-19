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
    <div className="bg-[#F6F3ED] rounded-3xl p-6 border border-[#D6CBBF] shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
      <p className="text-sm text-[#6B7C78] mb-2">Today’s focus</p>
      <h2 className="text-3xl font-semibold text-[#3A4F4B]">
        {format(seconds)}
      </h2>
    </div>
  );
}
