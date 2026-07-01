"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";
import useTimer from "@/hooks/useTimer";

import FocusTimerMonolith from "@/components/focus/FocusTimerMonolith";
import FocusControlPanel from "@/components/focus/FocusControlPanel";
import FocusContextCards from "@/components/focus/FocusContextCards";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function FocusPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectMeta, setSubjectMeta] = useState({});
  const [examMeta, setExamMeta] = useState({});
  // Note: completed plan slots are deleted from storage (see /api/update-task),
  // not flagged `completed: true` — so we can only ever know how many are left,
  // never a reliable "done / total" count. Don't fabricate one.
  const [remainingToday, setRemainingToday] = useState({ hasPlan: false, remaining: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayTotalSeconds, setTodayTotalSeconds] = useState(0);

  // Remembers which subject the timer is bound to, even while paused
  // (elapsed > 0 but no active DB session row) — otherwise pausing would
  // make the UI forget which subject "Resume" should continue.
  const [lastSubjectId, setLastSubjectId] = useState(null);

  // ── Timer hook ──
  const { activeSession, elapsed, startSession, stopSession, resetTimer } = useTimer(user?.id);

  // Kept in a ref so the visibility-refresh below always sees the latest
  // active session without re-subscribing its event listeners.
  const activeSessionRef = useRef(null);
  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  // If a session is already running when the page loads (or resumes on
  // its own), make sure lastSubjectId reflects it.
  useEffect(() => {
    if (activeSession?.subject_id) {
      setLastSubjectId(activeSession.subject_id);
    }
  }, [activeSession]);

  const isActive = !!activeSession;
  const isPaused = !isActive && elapsed > 0;
  const activeSubject =
    subjects.find((s) => s.id === (activeSession?.subject_id ?? (isPaused ? lastSubjectId : null))) || null;

  // ── Core data loader — subjects, plan status, exams, today + weekly totals ──
  const loadFocusData = useCallback(
    async (currentUser, { silent = false } = {}) => {
      if (!currentUser) return;
      if (!silent) setLoading(true);

      const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const today = nowIST.toISOString().slice(0, 10);

      const [{ data: subjectsData }, { data: planRow }, { data: examsData }] = await Promise.all([
        supabase
          .from("subjects")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("plans")
          .select("content")
          .eq("user_id", currentUser.id)
          .eq("plan_date", today)
          .maybeSingle(),
        supabase.from("exams").select("*, subjects(name)").eq("user_id", currentUser.id),
      ]);

      // Locate today's day object by date, not index — index breaks on multi-day plans.
      let todayDayObj = null;
      if (planRow) {
        const planData = typeof planRow.content === "string" ? JSON.parse(planRow.content) : planRow.content;
        todayDayObj = planData?.days?.find((d) => d.date === today) || null;
      }

      const allTodaySlots = todayDayObj?.slots || [];
      const incompleteSlots = allTodaySlots.filter((s) => !s.completed);
      const activeSubjectNames = new Set(
        incompleteSlots.map((s) => (s.subjectName || s.subject || "").toLowerCase())
      );

      // Subjects on Focus are driven entirely by today's plan. If there's no
      // plan yet, there's nothing to study here — don't fall back to every
      // subject ever created, or completed/old subjects reappear with no
      // plan to justify them.
      let visibleSubjects;
      if (planRow) {
        visibleSubjects =
          activeSubjectNames.size > 0
            ? (subjectsData || []).filter((s) => activeSubjectNames.has(s.name.toLowerCase()))
            : [];
      } else {
        visibleSubjects = [];
      }

      // Per-subject remaining-session count + next topic, from today's incomplete slots.
      const metaByName = {};
      for (const slot of incompleteSlots) {
        const key = (slot.subjectName || slot.subject || "").toLowerCase();
        if (!metaByName[key]) {
          metaByName[key] = { remainingSlots: 0, totalMinutes: 0, nextTopic: slot.topic || null };
        }
        metaByName[key].remainingSlots += 1;
        metaByName[key].totalMinutes += slot.durationMinutes || 0;
      }
      const nextSubjectMeta = {};
      for (const s of visibleSubjects) {
        nextSubjectMeta[s.id] = metaByName[s.name.toLowerCase()] || {
          remainingSlots: 0,
          totalMinutes: 0,
          nextTopic: null,
        };
      }

      // Nearest upcoming exam per subject, for the "Exam in Xd" badges.
      const nowMidnight = new Date(nowIST);
      nowMidnight.setHours(0, 0, 0, 0);
      const nextExamMeta = {};
      for (const e of examsData || []) {
        const examDate = new Date(e.exam_date);
        examDate.setHours(0, 0, 0, 0);
        const daysLeft = Math.round((examDate - nowMidnight) / (1000 * 60 * 60 * 24));
        if (daysLeft >= 0) {
          if (nextExamMeta[e.subject_id] === undefined || daysLeft < nextExamMeta[e.subject_id]) {
            nextExamMeta[e.subject_id] = daysLeft;
          }
        }
      }

      // Don't let a subject vanish out from under a timer that's still bound to it —
      // e.g. it was checked off on the Dashboard (in another tab) while this page
      // was backgrounded. Keep it visible until the person actually stops the timer.
      const boundId = activeSessionRef.current?.subject_id ?? lastSubjectId;
      if (boundId && !visibleSubjects.some((s) => s.id === boundId)) {
        const stillRegistered = (subjectsData || []).find((s) => s.id === boundId);
        if (stillRegistered) {
          visibleSubjects = [stillRegistered, ...visibleSubjects];
          if (!nextSubjectMeta[boundId]) {
            nextSubjectMeta[boundId] = { remainingSlots: 0, totalMinutes: 0, nextTopic: null };
          }
        }
      }

      setSubjects(visibleSubjects);
      setSubjectMeta(nextSubjectMeta);
      setExamMeta(nextExamMeta);
      // allTodaySlots only ever holds *unfinished* slots — the Dashboard deletes a
      // slot outright once it's checked off, it never persists `completed: true`.
      setRemainingToday({ hasPlan: !!planRow, remaining: allTodaySlots.length });

      // Today's total + a 7-day activity trail (local time, matching the Dashboard's
      // own "Today's Focus" and streak cards so the numbers agree across pages).
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const { data: sessionsData } = await supabase
        .from("sessions")
        .select("duration, start_time")
        .eq("user_id", currentUser.id)
        .gte("start_time", weekStart.toISOString());

      const todaySecondsTotal = (sessionsData || [])
        .filter((s) => new Date(s.start_time) >= startOfDay)
        .reduce((sum, s) => sum + (s.duration || 0), 0);
      setTodayTotalSeconds(todaySecondsTotal);

      const buckets = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        buckets.push({
          key: d.toDateString(),
          label: WEEKDAY_LABELS[d.getDay()],
          minutes: 0,
          isToday: i === 0,
        });
      }
      for (const s of sessionsData || []) {
        const key = new Date(s.start_time).toDateString();
        const bucket = buckets.find((b) => b.key === key);
        if (bucket) bucket.minutes += Math.round((s.duration || 0) / 60);
      }
      setWeeklyData(buckets);

      if (!silent) setLoading(false);
    },
    [lastSubjectId]
  );

  // ── Auth + initial load ──
  useEffect(() => {
    const init = async () => {
      const {
        data: { user: authedUser },
      } = await supabase.auth.getUser();

      if (!authedUser) {
        router.push("/login");
        return;
      }

      setUser(authedUser);
      await loadFocusData(authedUser);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // ── Keep the Study Queue in sync with checkboxes ticked on the Dashboard ──
  // Subjects (and their exams) are deleted server-side once every slot for
  // them is completed, so re-fetching on tab focus is enough to reflect it —
  // no separate realtime subscription needed.
  useEffect(() => {
    if (!user) return;

    const handleVisible = () => {
      if (document.visibilityState === "visible") {
        loadFocusData(user, { silent: true });
      }
    };

    window.addEventListener("visibilitychange", handleVisible);
    window.addEventListener("focus", handleVisible);
    return () => {
      window.removeEventListener("visibilitychange", handleVisible);
      window.removeEventListener("focus", handleVisible);
    };
  }, [user, loadFocusData]);

  // ── Handlers ──
  const handleSelectSubject = async (subjectId) => {
    // Tapping the subject that's already running pauses it in place.
    if (isActive && activeSession?.subject_id === subjectId) {
      const dur = await stopSession();
      if (dur) setTodayTotalSeconds((prev) => prev + dur);
      return;
    }
    const dur = await startSession(subjectId);
    setLastSubjectId(subjectId);
    if (dur) setTodayTotalSeconds((prev) => prev + dur);
  };

  const handleTogglePlayPause = async () => {
    if (isActive) {
      const dur = await stopSession();
      if (dur) setTodayTotalSeconds((prev) => prev + dur);
      return;
    }
    const targetId = lastSubjectId || subjects[0]?.id;
    if (!targetId) return;
    const dur = await startSession(targetId);
    setLastSubjectId(targetId);
    if (dur) setTodayTotalSeconds((prev) => prev + dur);
  };

  const handleReset = async () => {
    const dur = await resetTimer();
    if (dur) setTodayTotalSeconds((prev) => prev + dur);
    setLastSubjectId(null);
  };

  const todaySeconds = todayTotalSeconds + (isActive ? elapsed : 0);
  const hasNothingToShow = subjects.length === 0 && !isActive && !isPaused;

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-neutral-500 animate-pulse">Entering focus mode…</p>
      </div>
    );
  }

  // ── Empty state ──
  if (hasNothingToShow) {
    const hadPlanToday = remainingToday.hasPlan;
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
        </div>

        <div className="z-10 text-center space-y-8 max-w-md">
          <div className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-[0.2em] text-[#919191]">
            Focus Mode
          </div>
          <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-6xl md:text-7xl tracking-tighter text-white">
            {hadPlanToday ? "All Done Today" : "No Plan Yet"}
          </h1>
          <p className="text-neutral-500 mx-auto">
            {hadPlanToday
              ? "You've worked through everything on today's plan. Generate a new one or come back tomorrow."
              : "Tell the assistant what you're studying on the dashboard, and today's subjects will show up here."}
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
  const headline = activeSubject?.name || (subjects.length > 0 ? "Ready to Focus" : "Deep Work");
  const eyebrow = isActive ? "Current Session" : isPaused ? "Session Paused" : "Focus Mode";

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="z-10 text-center mb-10">
        <span className="font-[family-name:var(--font-inter)] uppercase tracking-[0.2em] text-[#919191] mb-4 block text-xs">
          {eyebrow}
        </span>
        <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-5xl md:text-6xl tracking-tighter text-white">
          {headline}
        </h1>
      </div>

      <FocusTimerMonolith
        elapsed={elapsed}
        isActive={isActive}
        isPaused={isPaused}
        activeSubject={activeSubject?.name}
      />

      <FocusControlPanel
        isActive={isActive}
        isPaused={isPaused}
        canStart={subjects.length > 0}
        onToggle={handleTogglePlayPause}
        onReset={handleReset}
      />

      <FocusContextCards
        subjects={subjects}
        subjectMeta={subjectMeta}
        examMeta={examMeta}
        activeSubject={activeSubject}
        isActive={isActive}
        todaySeconds={todaySeconds}
        weeklyData={weeklyData}
        remainingToday={remainingToday}
        onSelectSubject={handleSelectSubject}
      />
    </main>
  );
}