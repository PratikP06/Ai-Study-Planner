"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";

import TodayFocusCard from "@/components/dashboard/todayStats";
import FocusStreakCard from "@/components/dashboard/streak";
import StartFocusCard from "@/components/dashboard/startFocus";
import { FiCheck, FiArrowRight } from "react-icons/fi";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  // Plan state
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

      // ── Fetch today's plan ──
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
    if (!taskId) return;
    if (!planData || generating) return;

    const newPlan = JSON.parse(JSON.stringify(planData));
    const slot = newPlan.days[dayIndex].slots[slotIndex];
    if (slot.completed) return;

    slot.completed = true;
    setPlanData(newPlan);

    setTimeout(async () => {
      try {
        const res = await fetch("/api/update-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, taskId }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error("Failed to remove task from DB:", errData.error || res.status);
          setPlanData((currentPlan) => {
            if (!currentPlan) return currentPlan;
            const reverted = JSON.parse(JSON.stringify(currentPlan));
            reverted.days[dayIndex].slots[slotIndex].completed = false;
            return reverted;
          });
          return;
        }

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

  const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const todayDateStr = nowIST.toISOString().slice(0, 10);
  const todayDayIndex = planData?.days?.findIndex(d => d.date === todayDateStr) ?? 0;
  const todaysSlots = planData?.days?.[todayDayIndex]?.slots || [];

  return (
    <div className="px-6 sm:px-10 py-12">
      <div className="max-w-6xl mx-auto w-full space-y-12">

        {/* ── Welcome ── */}
        <section className="space-y-2">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Welcome back, {name || "there"}.
          </h1>
          <p className="text-neutral-500 text-base font-light">
            Here's what today looks like.
          </p>
        </section>

        {/* ── Stats Grid ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TodayFocusCard userId={user.id} />
          <FocusStreakCard userId={user.id} />
          <StartFocusCard />
        </section>

        {/* ── Plan + Assistant ── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

          {/* Today's Plan */}
          <div className="lg:col-span-3 bg-[#1c1b1b] rounded-2xl p-8 border border-white/5">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-white">
                Today's plan
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => window.scrollTo(0, document.body.scrollHeight)}
                  className="px-4 py-2 rounded-full text-xs text-neutral-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all duration-300"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => router.push("/dashboard/focus")}
                  className="px-4 py-2 rounded-full bg-white text-[#131313] text-xs font-semibold hover:bg-white/90 transition-all duration-300"
                >
                  Continue focus
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {planData ? (
                todaysSlots.length > 0 ? (
                  todaysSlots.map((slot, idx) => {
                    const isDone = slot.completed;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => completeTask(todayDayIndex, idx, slot.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${isDone ? "opacity-40" : "hover:bg-white/[0.03]"
                          }`}
                      >
                        <div
                          className={`shrink-0 h-5 w-5 rounded-full flex items-center justify-center border transition-all duration-300 ${isDone ? "bg-white border-white" : "border-white/20"
                            }`}
                        >
                          <FiCheck
                            className={`text-[#131313] text-xs transition-opacity duration-300 ${isDone ? "opacity-100" : "opacity-0"
                              }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium text-white truncate ${isDone ? "line-through" : ""}`}>
                            {slot.subjectName || slot.subject}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">{slot.topic}</p>
                        </div>
                        <span className="text-xs text-neutral-500 shrink-0">
                          {slot.durationMinutes} min
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-neutral-500 text-sm py-10 text-center font-light">
                    Today is clear. Everything planned for today is done.
                  </div>
                )
              ) : (
                <div className="text-neutral-500 text-sm py-10 text-center font-light">
                  No plan yet. Tell the assistant what you're studying.
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={generatePlan}
                disabled={generating || !aiPrompt.trim()}
                className="w-full rounded-full border border-white/10 py-4 px-6 flex items-center justify-center gap-3 text-sm text-white hover:bg-white/5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">
                  {generating ? "progress_activity" : "auto_awesome"}
                </span>
                <span className="font-medium">
                  {generating ? "Generating…" : "Build a detailed plan"}
                </span>
                {!generating && <FiArrowRight className="text-neutral-500" />}
              </button>
            </div>
          </div>

          {/* AI Assistant */}
          <div className="lg:col-span-2 bg-[#1c1b1b] rounded-2xl p-8 border border-white/5 space-y-6">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-white">
                Assistant
              </h2>
            </div>

            <div className="relative">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={generating}
                placeholder="Describe what you're studying and when it's due…"
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-4 pr-14 text-sm text-white placeholder:text-neutral-600 min-h-[110px] resize-none focus:outline-none focus:border-white/20 transition-colors"
              />
              <button
                onClick={generatePlan}
                disabled={generating || !aiPrompt.trim()}
                className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white text-[#131313] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-30"
              >
                <FiArrowRight className="text-sm" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Give it your subjects, how much time you have, and how many breaks you want — it builds the rest.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}