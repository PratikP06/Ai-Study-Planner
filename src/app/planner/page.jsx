"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/client";

export default function PlannerPage() {
  const router = useRouter();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);
  const [generatedAt, setGeneratedAt] = useState("");

  const generatePlan = async (regenerate = false) => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const [{ data: subjects }, { data: topics }, { data: exams }] =
      await Promise.all([
        supabase.from("subjects").select("*").eq("user_id", user.id),
        supabase.from("topics").select("*"),
        supabase.from("exams").select("*").eq("user_id", user.id),
      ]);

    // 🚫 FRONTEND GUARD
    if (!subjects?.length || !topics?.length) {
      setPlan(null);
      setCached(false);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        subjects,
        topics,
        exams,
        regenerate,
      }),
    });

    if (!res.ok) {
      setPlan(null);
      setLoading(false);
      return;
    }

    const data = await res.json();

    setPlan(data.plan);
    setCached(data.cached);
    setGeneratedAt(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      await generatePlan(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F0EEEA" }}
      >
        <p style={{ color: "#6B7C78" }}>
          Generating your study plan…
        </p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-4 md:px-6 lg:px-8 py-8"
      style={{ backgroundColor: "#F0EEEA" }}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: "#3A4F4B" }}
            >
              📅 Today’s Study Plan
            </h1>
            {plan && (
              <p className="text-sm mt-1" style={{ color: "#6B7C78" }}>
                Generated at {generatedAt} {cached && "• saved"}
              </p>
            )}
          </div>

          <button
            onClick={() => generatePlan(true)}
            disabled={!plan}
            className="px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
            style={{
              backgroundColor: "#97B3AE",
              color: "#FFFFFF",
            }}
          >
            🔁 Regenerate
          </button>
        </div>

        {/* Empty State */}
        {!plan ? (
          <div
            className="bg-white rounded-xl border p-6 text-center space-y-4"
            style={{ borderColor: "#D6CBBF" }}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: "#3A4F4B" }}
            >
              No study plan yet
            </h2>

            <p
              className="text-sm"
              style={{ color: "#6B7C78" }}
            >
              Add at least one subject and topic to generate your daily study plan.
            </p>

            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-2.5 rounded-md text-sm font-medium transition"
              style={{ backgroundColor: "#97B3AE", color: "#fff" }}
            >
              Add subjects & topics
            </button>
          </div>
        ) : (
          <div
            className="bg-white rounded-xl border p-5 md:p-6"
            style={{ borderColor: "#D6CBBF" }}
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p
                    className="text-sm leading-6 mb-3"
                    style={{ color: "#3A4F4B" }}
                  >
                    {children}
                  </p>
                ),
                h2: ({ children }) => (
                  <h2
                    className="text-base font-semibold mt-5 mb-2"
                    style={{ color: "#3A4F4B" }}
                  >
                    {children}
                  </h2>
                ),
                li: ({ children }) => (
                  <li
                    className="ml-4 list-disc text-sm leading-5 mb-1"
                    style={{ color: "#6B7C78" }}
                  >
                    {children}
                  </li>
                ),
              }}
            >
              {plan}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </main>
  );
}
