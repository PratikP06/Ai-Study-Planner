"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";

export default function HomePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  return (
    <main className="text-[#3A4F4B] bg-gradient-to-br from-[#F0DDD6] via-[#F0EEEA] to-[#D2E0D3]/40">
      <section className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
            Plan your studies. Calmly. Intelligently.
          </h1>

          <p className="text-base sm:text-lg text-[#6B7C78] leading-relaxed">
            An AI-powered study planner that organizes your subjects, tracks
            weak topics, and generates realistic daily plans — without burnout.
          </p>

          <div className="flex justify-center gap-4 pt-4 flex-wrap">
            <a
              href={user ? "/dashboard" : "/signup"}
              className="px-7 py-3 rounded-xl font-medium transition-all duration-200 shadow-[0_12px_35px_rgba(151,179,174,0.35)] hover:shadow-[0_18px_50px_rgba(151,179,174,0.45)] bg-[#97B3AE] text-white"
            >
              {user ? "Go to Dashboard" : "Get Started"}
            </a>

            <a
              href="/dashboard/ai"
              className="px-7 py-3 rounded-xl font-medium border border-[#D6CBBF] text-[#3A4F4B] hover:bg-white/40 transition-all duration-200"
            >
              View Planner
            </a>
          </div>
        </div>
      </section>

      <section className="min-h-screen flex items-center px-6">
        <div className="max-w-6xl mx-auto w-full space-y-16 text-center">
          <h2 className="text-3xl font-semibold">Why FlowState?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Focused Planning",
                desc: "Break subjects into clear, manageable sessions and study with structure.",
              },
              {
                title: "AI Personalization",
                desc: "Plans adapt based on exams, weak topics, and real progress.",
              },
              {
                title: "Sustainable Progress",
                desc: "No burnout. Just consistent, steady improvement.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#F6F3ED] rounded-3xl p-8 text-left  shadow-[0_25px_60px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] transition-all duration-300"
              >
                <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
                <p className="text-[#6B7C78]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="min-h-screen flex items-center px-6">
        <div className="max-w-6xl mx-auto w-full space-y-16 text-center">
          <h2 className="text-3xl font-semibold">How the AI Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Add Your Data",
                desc: "Enter subjects, topics, and upcoming exams.",
              },
              {
                step: "02",
                title: "Smart Analysis",
                desc: "AI evaluates weak areas and deadlines.",
              },
              {
                step: "03",
                title: "Balanced Study Plan",
                desc: "You receive realistic daily sessions optimized for focus.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#F6F3ED] rounded-3xl p-10 text-left shadow-[0_25px_60px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] transition-all duration-300"
              >
                <div className="text-sm font-medium text-[#97B3AE] mb-4">
                  {item.step}
                </div>

                <h3 className="font-semibold text-lg mb-3">{item.title}</h3>

                <p className="text-[#6B7C78]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="max-w-2xl space-y-8">
          <h2 className="text-3xl font-semibold">Ready to study smarter?</h2>

          <a
            href={user ? "/dashboard" : "/login"}
            className="inline-block px-10 py-4 rounded-xl font-medium shadow-[0_15px_40px_rgba(151,179,174,0.35)] hover:shadow-[0_20px_55px_rgba(151,179,174,0.45)] transition-all duration-200 bg-[#97B3AE] text-white"
          >
            {user ? "Go to Dashboard" : "Start Using FlowState"}
          </a>
        </div>
      </section>

      <footer className="px-6 py-16 bg-[#F6F3ED]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg font-semibold tracking-wide">FlowState</h3>

            <p className="text-sm text-[#6B7C78]">
              Independently designed & engineered.
            </p>
          </div>

          <div className="text-sm text-[#6B7C78] text-center">
            © {new Date().getFullYear()} FlowState. Built for calm productivity.
          </div>
        </div>
      </footer>
    </main>
  );
}
