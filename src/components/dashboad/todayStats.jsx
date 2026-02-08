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
    <div className="rounded-xl p-6 bg-white shadow-sm">
      <p className="text-sm text-gray-500">Today’s focus</p>
      <h2 className="text-2xl font-semibold mt-2">
        {format(seconds)}
      </h2>
    </div>
  );
}
