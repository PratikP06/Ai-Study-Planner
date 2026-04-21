"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip as HeatmapTooltip } from "react-tooltip";

import "react-calendar-heatmap/dist/styles.css";
import "react-tooltip/dist/react-tooltip.css";

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id);

      setSessions(data || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-neutral-500 animate-pulse">Loading analytics…</p>
      </div>
    );
  }

  const yearSessions = sessions.filter(
    (s) => new Date(s.created_at).getFullYear() === currentYear,
  );

  const totalSeconds = yearSessions.reduce((sum, s) => sum + s.duration, 0);

  const studyDays = new Set(
    yearSessions.map((s) => new Date(s.created_at).toDateString()),
  ).size;

  const totalDisplay =
    totalSeconds < 3600
      ? Math.floor(totalSeconds / 60) + "m"
      : (totalSeconds / 3600).toFixed(1) + "h";

  const avgDisplay =
    studyDays === 0
      ? "0m"
      : totalSeconds / studyDays < 3600
        ? Math.floor(totalSeconds / studyDays / 60) + "m"
        : (totalSeconds / studyDays / 3600).toFixed(1) + "h";

  const heatmapData = Object.values(
    yearSessions.reduce((acc, session) => {
      const date = new Date(session.created_at).toISOString().slice(0, 10);

      if (!acc[date]) acc[date] = { date, count: 0 };
      acc[date].count += session.duration;
      return acc;
    }, {}),
  );

  return (
    <div className="px-6 sm:px-10 py-12">

      <div className="max-w-6xl mx-auto space-y-12">
        <header className="space-y-3">
          <div className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            Performance Metrics
          </div>
          <h1 className="flex items-center gap-3 text-3xl sm:text-4xl font-[family-name:var(--font-space-grotesk)] font-bold tracking-tight text-white text-glow">
            Analytics
            <BarChart3 size={24} className="text-white/40" />
          </h1>
          <p className="text-sm text-neutral-500">
            Your study insights for {currentYear}
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-3">
          <StatCard title="Total Study Time" value={totalDisplay} />
          <StatCard title="Study Days" value={studyDays} />
          <StatCard title="Avg per Study Day" value={avgDisplay} />
        </section>

        <section
          className="bg-[#1c1b1b] rounded-2xl p-8 border border-white/5 glow-border-resting"
        >
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-white mb-6">
            Study Heatmap
          </h2>

          <div className="overflow-x-auto">
            <div className="min-w-[700px] sm:min-w-full">
              <CalendarHeatmap
                startDate={new Date(currentYear, 0, 1)}
                endDate={new Date(currentYear, 11, 31)}
                values={heatmapData}
                classForValue={(value) => {
                  if (!value || value.count === 0) return "color-empty";

                  const hours = value.count / 3600;

                  if (hours < 0.5) return "color-scale-1";
                  if (hours < 2) return "color-scale-2";
                  return "color-scale-3";
                }}
                tooltipDataAttrs={(value) => {
                  if (!value || !value.date) return {};

                  const hours = (value.count / 3600).toFixed(2);

                  return {
                    "data-tooltip-id": "heatmap-tooltip",
                    "data-tooltip-content": `${value.date} • ${hours}h studied`,
                  };
                }}
              />

              <HeatmapTooltip
                id="heatmap-tooltip"
                style={{
                  backgroundColor: "#1c1b1b",
                  color: "#e5e2e1",
                  borderRadius: "12px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      className="bg-[#1c1b1b] rounded-2xl p-6 border border-white/5 glow-border-resting glow-border-hover transition-all duration-300"
    >
      <p className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-widest text-neutral-500">{title}</p>
      <h2 className="text-3xl font-[family-name:var(--font-space-grotesk)] font-bold text-white mt-2">{value}</h2>
    </div>
  );
}
