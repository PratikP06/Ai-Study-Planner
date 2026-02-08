"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";

export default function useTimer(userId) {
  const [activeSession, setActiveSession] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  // 1️⃣ Fetch active session
  useEffect(() => {
    if (!userId) return;

    const fetchActiveSession = async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", userId)
        .is("end_time", null)
        .maybeSingle(); // ✅ FIX

      if (error) {
        console.error("Fetch active session error:", error);
        return;
      }

      if (data) {
        setActiveSession(data);
        const diff =
          Date.now() - new Date(data.start_time).getTime();
        setElapsed(Math.floor(diff / 1000));
      } else {
        setActiveSession(null);
        setElapsed(0);
      }
    };

    fetchActiveSession();
  }, [userId]);

  // 2️⃣ Live ticking
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const diff =
        Date.now() - new Date(activeSession.start_time).getTime();
      setElapsed(Math.floor(diff / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // 3️⃣ Start session
  const startSession = async (subjectId) => {
    // Stop existing session safely
    const { data: existing } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .is("end_time", null)
      .maybeSingle(); // ✅ FIX

    if (existing) {
      const end = new Date();
      const duration = Math.floor(
        (end - new Date(existing.start_time)) / 1000
      );

      await supabase
        .from("sessions")
        .update({
          end_time: end.toISOString(),
          duration,
        })
        .eq("id", existing.id);
    }

    // Start new session
    const { data: newSession, error } = await supabase
      .from("sessions")
      .insert({
        user_id: userId,
        subject_id: subjectId,
        start_time: new Date().toISOString(),
      })
      .select()
      .single(); // ✅ safe here (insert always returns 1)

    if (error) {
      console.error("Start session error:", error);
      return;
    }

    setActiveSession(newSession);
    setElapsed(0);
  };

  // 4️⃣ Stop session
  const stopSession = async () => {
    if (!activeSession) return;

    const end = new Date();
    const duration = Math.floor(
      (end - new Date(activeSession.start_time)) / 1000
    );

    await supabase
      .from("sessions")
      .update({
        end_time: end.toISOString(),
        duration,
      })
      .eq("id", activeSession.id);

    setActiveSession(null);
    setElapsed(0);
  };

  return {
    activeSession,
    elapsed,
    startSession,
    stopSession,
  };
}
