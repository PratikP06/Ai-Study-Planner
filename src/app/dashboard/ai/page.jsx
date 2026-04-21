"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";
import { FiRefreshCw, FiClock } from "react-icons/fi";
import { Sparkles, AlertCircle } from "lucide-react";
import PromptInput from "@/components/planner/PromptInput";
import PlanTimetable from "@/components/planner/PlanTimetable";

export default function AIPage() {
  const router = useRouter();

  // ── Prompt / config state ──────────────────────────────────────────────────
  const [userPrompt, setUserPrompt] = useState("");
  const [studyDuration, setStudyDuration] = useState(7);

  // ── Plan state ─────────────────────────────────────────────────────────────
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cached, setCached] = useState(false);
  const [generatedAt, setGeneratedAt] = useState("");

  // ── Core generation function ───────────────────────────────────────────────
  const generatePlan = async (regenerate = false) => {
    setLoading(true);
    setError("");

    try {
      // Auth check
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch structured data in parallel
      const [{ data: subjects }, { data: allTopics }, { data: exams }] =
        await Promise.all([
          supabase.from("subjects").select("*").eq("user_id", user.id),
          supabase.from("topics").select("*"),
          supabase
            .from("exams")
            .select("*, subjects(name)")
            .eq("user_id", user.id),
        ]);

      // Filter topics to only those belonging to this user's subjects
      const subjectIds = new Set((subjects || []).map((s) => s.id));
      const topics = (allTopics || []).filter((t) => subjectIds.has(t.subject_id));

      // Call the generate-plan endpoint
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          subjects: subjects || [],
          topics,
          exams: exams || [],
          userPrompt,
          studyDuration,
          regenerate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setPlan(data.plan);
      setCached(data.cached);

      if (data.createdAt) {
        setGeneratedAt(
          new Date(data.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-6 sm:px-10 py-12">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Page Header ── */}
        <div
          className="bg-[#1c1b1b] rounded-2xl p-8 border border-white/5 glow-border-resting
            flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Neural Architecture
            </div>
            <h1 className="flex items-center gap-3 text-3xl sm:text-4xl font-[family-name:var(--font-space-grotesk)] font-bold tracking-tight text-white text-glow">
              The Architect
              <Sparkles size={24} className="text-white/40" />
            </h1>
            <p className="text-sm text-neutral-500 max-w-md">
              Describe your goals and let AI build a personalised day-wise study plan.
            </p>
            {generatedAt && (
              <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1">
                <FiClock size={12} />
                <span>
                  Last generated at {generatedAt}
                  {cached && " · from cache"}
                </span>
              </div>
            )}
          </div>

          {/* Header actions — only shown once a plan exists */}
          {plan && (
            <div className="flex gap-3 flex-wrap">
              <button
                id="regenerate-plan-btn"
                onClick={() => generatePlan(true)}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold
                  bg-white text-[#1a1c1c] hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]
                  disabled:opacity-50 transition-all duration-200"
              >
                <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Regenerate
              </button>

              <button
                onClick={() => router.push("/history")}
                className="px-6 py-3 rounded-full text-sm border border-white/10
                  text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              >
                View History
              </button>
            </div>
          )}
        </div>

        {/* ── Prompt Input ── */}
        <PromptInput
          value={userPrompt}
          onChange={setUserPrompt}
          duration={studyDuration}
          onDurationChange={setStudyDuration}
          onSubmit={() => generatePlan(true)}
          loading={loading}
        />

        {/* ── Error Banner ── */}
        {error && (
          <div
            className="flex items-start gap-3 bg-red-400/10 border border-red-400/20
              rounded-2xl px-5 py-4 text-sm text-red-400"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* ── Loading Skeleton ── */}
        {loading && (
          <div className="space-y-6">
            <LoadingSkeleton />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <LoadingSkeleton key={i} height="h-64" />
              ))}
            </div>
          </div>
        )}

        {/* ── Plan Output ── */}
        {plan && !loading && <PlanTimetable plan={plan} />}

        {/* ── Empty / Welcome State ── */}
        {!plan && !loading && !error && (
          <div className="text-center py-24 text-neutral-500">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-5">
              <Sparkles size={28} className="text-white/30" />
            </div>
            <p className="text-base font-medium text-white mb-2">
              Your personalised plan starts here
            </p>
            <p className="text-sm max-w-sm mx-auto leading-relaxed">
              Enter a prompt describing your priorities and study duration above,
              then click <strong className="text-white">Generate Plan</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton({ height = "h-24" }) {
  return (
    <div
      className={`${height} bg-[#1c1b1b] rounded-2xl border border-white/5
        animate-pulse`}
    />
  );
}
