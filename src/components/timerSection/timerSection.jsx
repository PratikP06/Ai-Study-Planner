"use client";

import { useEffect, useState } from "react";
import SubjectTimerCard from "./SubjectTimerCard";
import useTimer from "@/hooks/useTimer";
import { supabase } from "@/lib/client";

export default function TimerSection({ subjects, userId }) {
  const timer = useTimer(userId); // ✅ single timer brain
  const [todayTotals, setTodayTotals] = useState({});

  useEffect(() => {
    const fetchTodayTotals = async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from("sessions")
        .select("subject_id, duration")
        .eq("user_id", userId)
        .gte("start_time", startOfDay.toISOString());

      const map = {};
      (data || []).forEach((row) => {
        map[row.subject_id] =
          (map[row.subject_id] || 0) + (row.duration || 0);
      });

      setTodayTotals(map);
    };

    fetchTodayTotals();
  }, [userId]);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-[#3A4F4B]">
        Study Timer
      </h2>

      {subjects.map((subject) => (
        <SubjectTimerCard
          key={subject.id}
          subject={subject}
          todayTotal={todayTotals[subject.id] || 0}
          {...timer}
        />
      ))}
    </div>
  );
}
