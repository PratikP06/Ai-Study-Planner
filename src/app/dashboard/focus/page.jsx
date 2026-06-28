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

      // Fetch all subjects from DB
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      // FIX: Cross-reference with today's plan to only show subjects
      // that still have incomplete slots. Without this, subjects from
      // previously completed sessions keep showing in the Focus selector.
      const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const today = nowIST.toISOString().slice(0, 10);

      const { data: planRow } = await supabase
        .from("plans")
        .select("content")
        .eq("user_id", user.id)
        .eq("plan_date", today)
        .maybeSingle();

      if (planRow) {
        const planData = typeof planRow.content === "string"
          ? JSON.parse(planRow.content)
          : planRow.content;

        // Find today's day object by date (not by index — index can be wrong on multi-day plans)
        const todayDayObj = planData?.days?.find(d => d.date === today);
        const activeSlots = todayDayObj?.slots || [];

        // Build a set of subject names that still have at least one incomplete slot
        const activeSubjectNames = new Set(
          activeSlots
            .filter(s => !s.completed)
            .map(s => (s.subjectName || s.subject || "").toLowerCase())
        );

        if (activeSubjectNames.size > 0) {
          // Only show subjects that are still needed today
          const filtered = (subjectsData || []).filter(s =>
            activeSubjectNames.has(s.name.toLowerCase())
          );
          setSubjects(filtered);
        } else {
          // All tasks done or no slots — show nothing (or could show all)
          setSubjects([]);
        }
      } else {
        // No active plan today — show all subjects so user can still start a free session
        setSubjects(subjectsData || []);
      }

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
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
        </div>

        <div className="z-10 text-center space-y-8">
          <div className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-[0.2em] text-[#919191]">Focus Mode</div>
          <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-6xl md:text-7xl tracking-tighter text-white">
            All Done Today 🎉
          </h1>
          <p className="text-neutral-500 max-w-md mx-auto">
            You've completed all subjects for today. Generate a new plan or come back tomorrow.
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
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="z-10 text-center mb-16">
        <span className="font-[family-name:var(--font-inter)] uppercase tracking-[0.2em] text-[#919191] mb-4 block text-xs">
          Current Session
        </span>
        <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-6xl md:text-7xl tracking-tighter text-white">
          Deep Work
        </h1>
      </div>

      <FocusTimerMonolith
        elapsed={elapsed}
        isActive={isActive}
        activeSubject={activeSubject?.name}
      />

      <FocusControlPanel
        isActive={isActive}
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleReset}
      />

      <FocusContextCards
        subjects={subjects}
        activeSubject={activeSubject}
        todaySeconds={todaySeconds}
        onSelectSubject={handleSelectSubject}
      />
    </main>
  );
}