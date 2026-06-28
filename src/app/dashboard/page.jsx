"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";

import TodayFocusCard from "@/components/dashboard/todayStats";
import FocusStreakCard from "@/components/dashboard/streak";
import StartFocusCard from "@/components/dashboard/startFocus";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import { MdAutoAwesome } from "react-icons/md";

// Note: Removed SubjectsSection and ExamsSection globally here, replaced with AI Workflow

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  // AI Workflow State
  const [planData, setPlanData] = useState(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

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

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (profile?.name) {
        setName(profile.name.toUpperCase());
      }

      // Fetch Today's Plan
      const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const today = nowIST.toISOString().slice(0, 10);
      const { data: existingPlan } = await supabase
        .from("plans")
        .select("content")
        .eq("user_id", user.id)
        .eq("plan_date", today)
        .single();

      if (existingPlan) {
        const parsed = typeof existingPlan.content === "string"
          ? JSON.parse(existingPlan.content)
          : existingPlan.content;
        setPlanData(parsed);
      }

      setLoading(false);
    };

    init();
  }, [router]);

  const completeTask = async (dayIndex, slotIndex, taskId) => {
    if (!taskId) {
      console.error("Missing taskId for completion action");
      return;
    }
    console.log("Sending taskId:", taskId);

    if (!planData || generating) return;

    // 1. Optimistic UI update: mark as completed (shows checkmark + fade)
    const newPlan = JSON.parse(JSON.stringify(planData));
    const slot = newPlan.days[dayIndex].slots[slotIndex];
    if (slot.completed) return; // Prevent double clicks

    slot.completed = true;
    setPlanData(newPlan);

    // 2. Call API FIRST — only remove from UI if DB update succeeds
    setTimeout(async () => {
      try {
        const res = await fetch("/api/update-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, taskId }),
        });

        // BUG FIX #3: Check response before removing from UI state.
        // Previously, any API error was silently swallowed — the task disappeared
        // from UI but the DB was never updated, so it reappeared on refresh.
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error("Failed to remove task from DB:", errData.error || res.status);
          // Revert the optimistic UI update so user knows something went wrong
          setPlanData((currentPlan) => {
            if (!currentPlan) return currentPlan;
            const reverted = JSON.parse(JSON.stringify(currentPlan));
            reverted.days[dayIndex].slots[slotIndex].completed = false;
            return reverted;
          });
          return;
        }

        // DB updated successfully — now remove from UI
        setPlanData((currentPlan) => {
          if (!currentPlan) return currentPlan;
          const updated = JSON.parse(JSON.stringify(currentPlan));
          updated.days[dayIndex].slots = updated.days[dayIndex].slots.filter(
            (s) => s.id !== taskId
          );
          return updated;
        });
      } catch (err) {
        console.error("Failed to update task", err);
        // Revert optimistic update on network failure
        setPlanData((currentPlan) => {
          if (!currentPlan) return currentPlan;
          const reverted = JSON.parse(JSON.stringify(currentPlan));
          if (reverted.days[dayIndex]?.slots[slotIndex]) {
            reverted.days[dayIndex].slots[slotIndex].completed = false;
          }
          return reverted;
        });
      }
    }, 300);
  };

  const applySuggestion = (text) => setAiPrompt(text);

  const generatePlan = async () => {
    if (!aiPrompt.trim() || generating) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userPrompt: aiPrompt,
          studyDuration: 7,
          regenerate: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate plan");
      const { plan } = await res.json();
      setPlanData(plan);
      setAiPrompt("");
    } catch (err) {
      console.error(err);
      alert("Error generating plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-neutral-500 animate-pulse">Loading dashboard…</p>
      </div>
    );
  }

  // BUG FIX #3: Find today's actual day by date, not by assuming index 0.
  // If a 7-day plan was generated yesterday, today is day 2 (index 1), not index 0.
  const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const todayDateStr = nowIST.toISOString().slice(0, 10);
  const todayDayIndex = planData?.days?.findIndex(d => d.date === todayDateStr) ?? 0;
  const todaysSlots = planData?.days?.[todayDayIndex]?.slots || [];

  return (
    <div className="px-6 sm:px-10 py-12">
      <div className="max-w-7xl mx-auto w-full space-y-10">

        {/* ── Welcome Header ── */}
        <section>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl md:text-6xl font-extrabold tracking-tighter text-white text-glow-headline">
            Welcome back, {name || "USER"}.
          </h1>
          <p className="text-[#acabaa] mt-2 text-lg">The silence is perfect for deep work tonight.</p>
        </section>

        {/* ── Stats Grid ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TodayFocusCard userId={user.id} />
          <FocusStreakCard userId={user.id} />
          <StartFocusCard />
        </section>

        {/* ── Main Section: New AI Workflow ── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left Column: Today's Plan */}
          <div className="lg:col-span-3 bg-[#191a1a] rounded-lg p-8 border-t border-white/10 glow-border-resting">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#e7e5e5]">Today's Plan</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.scrollTo(0, document.body.scrollHeight)}
                  className="px-4 py-2 bg-[#1f2020] text-[#e7e5e5] text-xs font-bold rounded-full hover:bg-[#3a3939] transition-colors"
                >
                  Regenerate Plan
                </button>
                <button
                  onClick={() => router.push('/dashboard/focus')}
                  className="px-4 py-2 bg-[#c6c6c7] text-[#3f4041] text-xs font-bold rounded-full hover:bg-[#d4d4d4] transition-colors"
                >
                  Continue Focus
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {planData ? (
                todaysSlots.length > 0 ? (
                  todaysSlots.map((slot, idx) => {
                    const isDone = slot.completed;
                    return (
                      <div
                        key={slot.id}
                        className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 group cursor-pointer ${isDone ? 'bg-[#252626] opacity-50 scale-95' : 'hover:bg-[#252626] opacity-100 scale-100'
                          }`}
                        onClick={() => completeTask(todayDayIndex, idx, slot.id)}
                      >
                        <div className="flex-shrink-0">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 ${isDone ? 'bg-[#c6c6c7]' : 'border-2 border-[#484848] group-hover:border-[#c6c6c7]'
                            }`}>
                            <FiCheck className={`text-[#3f4041] text-sm font-bold transition-opacity duration-300 ${isDone ? 'opacity-100' : 'opacity-0'}`} />
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className={`font-semibold transition-all duration-300 ${isDone ? 'text-white line-through' : 'text-[#e7e5e5]'}`}>
                            {slot.subjectName || slot.subject}
                          </p>
                          <p className={`text-sm transition-all duration-300 ${isDone ? 'text-[#acabaa] line-through' : 'text-[#acabaa]'}`}>
                            {slot.topic}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-medium transition-all duration-300 ${isDone ? 'text-[#acabaa]' : 'text-[#acabaa]'}`}>
                            {slot.durationMinutes} mins
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[#acabaa] py-8 text-center italic">
                    All tasks completed 🎉 Generate a new plan
                  </div>
                )
              ) : (
                <div className="text-[#acabaa] py-8 text-center italic">
                  No plan generated yet. Use the AI Assistant to create a study schedule.
                </div>
              )}
            </div>

            <div className="mt-10">
              <button
                onClick={generatePlan}
                disabled={generating || !aiPrompt.trim()}
                className="w-full group relative overflow-hidden rounded-full bg-[#2b2c2c] py-6 px-8 flex items-center justify-center space-x-4 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <MdAutoAwesome className={`text-[#c6c6c7] text-2xl ${generating ? 'animate-spin' : 'animate-pulse'}`} />
                <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold tracking-tight text-[#e7e5e5]">
                  {generating ? "Generating Plan..." : "Make Detailed plan with Ai"}
                </span>
                {!generating && <FiArrowRight className="text-[#e7e5e5]/50 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </div>

          {/* Right Column: AI Assistant */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg p-8 border-t border-white/10 glow-border-resting bg-[#2b2c2c]/40 backdrop-blur-[20px]">
              <div className="flex items-center space-x-3 mb-6">
                <MdAutoAwesome className="text-[#c6c6c7] text-3xl" />
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#e7e5e5]">AI Assistant</h2>
              </div>

              <div className="relative mb-8">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-[#3a3939]/40 border-none rounded-xl p-5 text-[#e7e5e5] placeholder:text-[#c6c6c6]/50 focus:ring-2 focus:ring-[#c6c6c7]/20 min-h-[120px] resize-none focus:outline-none"
                  placeholder="Ask AI to update your schedule..."
                  disabled={generating}
                />
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={generatePlan}
                    disabled={generating || !aiPrompt.trim()}
                    className="h-10 w-10 rounded-full bg-[#c6c6c7] text-[#3f4041] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    <FiArrowRight />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-[#c6c6c6] uppercase tracking-widest mb-4">Quick Suggestions</p>
                <button onClick={() => applySuggestion("Plan next 5 days")} className="w-full text-left p-3 rounded-xl bg-[#2a2a2a] hover:bg-[#3a3939] text-[#e7e5e5] text-sm font-medium transition-colors border border-white/5">
                  Plan next 5 days
                </button>
                <button onClick={() => applySuggestion("Focus intensely on DSA topics")} className="w-full text-left p-3 rounded-xl bg-[#2a2a2a] hover:bg-[#3a3939] text-[#e7e5e5] text-sm font-medium transition-colors border border-white/5">
                  Focus on DSA
                </button>
                <button onClick={() => applySuggestion("Revise weak topics from previous weeks")} className="w-full text-left p-3 rounded-xl bg-[#2a2a2a] hover:bg-[#3a3939] text-[#e7e5e5] text-sm font-medium transition-colors border border-white/5">
                  Revise weak topics
                </button>
              </div>
            </div>

            <div className="bg-[#2a2a2a] rounded-lg p-8 border-t border-white/10 glow-border-resting overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold mb-2 text-white">Focus Insight</h3>
                <p className="text-[#c6c6c6] text-sm leading-relaxed">
                  {planData?.summary || "You're most productive between 10 PM and 1 AM. Your deep focus sessions are 22% longer during these hours."}
                </p>
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}