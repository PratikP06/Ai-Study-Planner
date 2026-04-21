"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";
import useTimer from "@/hooks/useTimer";

import FocusTimerMonolith from "@/components/focus/FocusTimerMonolith";
import FocusControlPanel from "@/components/focus/FocusControlPanel";
import FocusContextCards from "@/components/focus/FocusContextCards";

export default function FocusPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayTotalSeconds, setTodayTotalSeconds] = useState(0);

  // ── Auth + subjects fetch ──
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      setSubjects(subjectsData || []);

      // Fetch today's total study time
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: sessionsData } = await supabase
        .from("sessions")
        .select("duration")
        .eq("user_id", user.id)
        .gte("start_time", startOfDay.toISOString());

      const total = (sessionsData || []).reduce((sum, s) => sum + (s.duration || 0), 0);
      setTodayTotalSeconds(total);

      setLoading(false);
    };

    init();
  }, [router]);

  // ── Timer hook ──
  const { activeSession, elapsed, startSession, stopSession, resetTimer } = useTimer(user?.id);

  // Derive the active subject object
  const activeSubject = activeSession
    ? subjects.find((s) => s.id === activeSession.subject_id) || null
    : null;

  const isActive = !!activeSession;

  // ── Handlers ──
  const handleStart = async () => {
    // If there are subjects but none is selected yet, pick the first one
    if (subjects.length > 0) {
      const dur = await startSession(subjects[0].id);
      if (dur) setTodayTotalSeconds((prev) => prev + dur);
    }
  };

  const handleSelectSubject = async (subjectId) => {
    const dur = await startSession(subjectId);
    if (dur) setTodayTotalSeconds((prev) => prev + dur);
  };

  const handleStop = async () => {
    if (activeSession) {
      const dur = await stopSession();
      if (dur) setTodayTotalSeconds((prev) => prev + dur);
    }
  };

  const handleReset = async () => {
    const dur = await resetTimer();
    if (dur) setTodayTotalSeconds((prev) => prev + dur);
  };

  // Today's hours (including current elapsed)
const todaySeconds = todayTotalSeconds + (isActive ? elapsed : 0);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-neutral-500 animate-pulse">Entering focus mode…</p>
      </div>
    );
  }

  // ── Empty state ──
  if (subjects.length === 0) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background blurs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
        </div>

        <div className="z-10 text-center space-y-8">
          <div className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-[0.2em] text-[#919191]">Focus Mode</div>
          <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-6xl md:text-7xl tracking-tighter text-white">
            No Subjects Yet
          </h1>
          <p className="text-neutral-500 max-w-md mx-auto">
            Add subjects on the dashboard to begin your focus sessions.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="primary-cta-gradient text-[#1a1c1c] font-bold px-10 py-5 rounded-full text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Main focus UI ──
  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background Monolith Texture */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
      </div>

      {/* Focus Mode Header */}
      <div className="z-10 text-center mb-16">
        <span className="font-[family-name:var(--font-inter)] uppercase tracking-[0.2em] text-[#919191] mb-4 block text-xs">
          Current Session
        </span>
        <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-6xl md:text-7xl tracking-tighter text-white">
          Deep Work
        </h1>
      </div>

      {/* Large Centered Timer Monolith */}
      <FocusTimerMonolith
        elapsed={elapsed}
        isActive={isActive}
        activeSubject={activeSubject?.name}
      />

      {/* Minimal Control Actions */}
      <FocusControlPanel
        isActive={isActive}
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleReset}
      />

      {/* Contextual Bento Widgets */}
     <FocusContextCards
  subjects={subjects}
  activeSubject={activeSubject}
  todaySeconds={todaySeconds}   // ← rename prop
  onSelectSubject={handleSelectSubject}
/>
    </main>
  );
}
