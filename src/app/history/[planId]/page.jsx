"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function PlanDetailPage() {
  const { planId } = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data } = await supabase
        .from("plans")
        .select("*")
        .eq("id", planId)
        .single();

      setPlan(data);
    };

    fetchPlan();
  }, [planId, router]);

  if (!plan) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F0EEEA" }}
      >
        <p style={{ color: "#6B7C78" }}>Loading plan…</p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-4 md:px-6 lg:px-8 py-8"
      style={{ backgroundColor: "#F0EEEA" }}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="text-sm font-medium transition hover:opacity-70"
          style={{ color: "#97B3AE" }}
        >
          ← Back to history
        </button>

        {/* Title */}
        <header>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "#3A4F4B" }}
          >
            📅 {new Date(plan.plan_date).toDateString()}
          </h1>
        </header>

        {/* Plan */}
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
              strong: ({ children }) => (
                <strong
                  className="font-semibold"
                  style={{ color: "#3A4F4B" }}
                >
                  {children}
                </strong>
              ),
            }}
          >
            {plan.content}
          </ReactMarkdown>
        </div>
      </div>
    </main>
  );
}
