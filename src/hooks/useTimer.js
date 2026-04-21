"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";

export default function useTimer(userId) {
  const [activeSession, setActiveSession] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [baseElapsed, setBaseElapsed] = useState(0); // ← accumulated time from previous segments

  useEffect(() => {
    if (!userId) return; // ← already have this, but make sure userId is truly ready

  const fetchActiveSession = async () => {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .is("end_time", null)
      .order("start_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code) { // ← only log real errors, not empty {}
      console.error("Fetch active session error:", error);
      return;
    }

      if (data) {
        setActiveSession(data);
        const diff = Math.floor((Date.now() - new Date(data.start_time).getTime()) / 1000);
        // Restore baseElapsed from metadata if you persist it, otherwise just use diff
        setBaseElapsed(0);
        setElapsed(diff);
      } else {
        setActiveSession(null);
        setElapsed(0);
        setBaseElapsed(0);
      }
    };

    fetchActiveSession();
  }, [userId]);

  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - new Date(activeSession.start_time).getTime()) / 1000);
      setElapsed(baseElapsed + diff); // ← add accumulated base time
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, baseElapsed]); // ← depend on baseElapsed too

  const startSession = async (subjectId) => {
    const { data: existing } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .is("end_time", null)
      .order("start_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    let previousDuration = null;

    if (existing) {
      const end = new Date();
      previousDuration = Math.floor((end - new Date(existing.start_time)) / 1000);

      await supabase
        .from("sessions")
        .update({ end_time: end.toISOString(), duration: previousDuration })
        .eq("id", existing.id);
    }

    const { data: newSession, error } = await supabase
      .from("sessions")
      .insert({
        user_id: userId,
        subject_id: subjectId,
        start_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Start session error:", error);
      return;
    }

    setActiveSession(newSession);
    // ← carry over elapsed so timer continues from where it paused
    setBaseElapsed((prev) => prev + (previousDuration ?? 0));
    return previousDuration;
  };

  const stopSession = async () => {
    if (!activeSession) return null;

    const end = new Date();
    const duration = Math.floor((end - new Date(activeSession.start_time)) / 1000);

    await supabase
      .from("sessions")
      .update({ end_time: end.toISOString(), duration })
      .eq("id", activeSession.id);

    const totalElapsed = baseElapsed + duration;
    setActiveSession(null);
    setElapsed(totalElapsed); // ← show full accumulated time when paused
    // don't reset baseElapsed here — keep it so resume can continue
    setBaseElapsed(totalElapsed);
    return duration;
  };

  const resetTimer = async () => {
    let duration = 0;
    if (activeSession) {
      const end = new Date();
      duration = Math.floor((end - new Date(activeSession.start_time)) / 1000);

      await supabase
        .from("sessions")
        .update({ end_time: end.toISOString(), duration })
        .eq("id", activeSession.id);
    }

    setActiveSession(null);
    setElapsed(0);
    setBaseElapsed(0);
    return duration;
  };

  return {
    activeSession,
    elapsed,
    startSession,
    stopSession,
    resetTimer, // ← expose this so your Reset button actually zeroes everything
  };
}