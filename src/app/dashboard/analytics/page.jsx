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
            <div className="min-h-screen flex items-center justify-center bg-[#F0EEEA]">
                <p className="text-sm text-[#6B7C78]">Loading analytics…</p>
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
            const date = new Date(session.created_at)
                .toISOString()
                .slice(0, 10);

            if (!acc[date]) acc[date] = { date, count: 0 };
            acc[date].count += session.duration;
            return acc;
        }, {}),
    );

    return (
        <div
            className="min-h-screen bg-gradient-to-br 
    from-[#F0DDD6] via-[#F0EEEA] to-[#F2C3B9]/40 
    px-4 sm:px-8 py-12"
        >
            <div className="max-w-6xl mx-auto space-y-16">
                                <header className="space-y-2">
                    <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-semibold text-[#3A4F4B]">
                        
                        Analytics
                        <BarChart3 size={24} className="text-[#97B3AE]" />
                    </h1>

                    <p className="text-sm text-[#6B7C78]">
                        Your study insights for {currentYear}
                    </p>
                </header>

                                <section className="grid gap-6 sm:grid-cols-3">
                    <StatCard title="Total Study Time" value={totalDisplay} />
                    <StatCard title="Study Days" value={studyDays} />
                    <StatCard title="Avg per Study Day" value={avgDisplay} />
                </section>

                                <section
                    className="bg-[#F6F3ED] rounded-3xl p-8 
        shadow-[0_15px_40px_rgba(0,0,0,0.06)]"
                >
                    <h2 className="text-lg font-semibold text-[#3A4F4B] mb-6">
                        Study Heatmap
                    </h2>

                    <div className="overflow-x-auto">
                        <CalendarHeatmap
                            startDate={new Date(currentYear, 0, 1)}
                            endDate={new Date(currentYear, 11, 31)}
                            values={heatmapData}
                            classForValue={(value) => {
                                if (!value || value.count === 0)
                                    return "color-empty";

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
                                backgroundColor: "#3A4F4B",
                                color: "#fff",
                                borderRadius: "12px",
                                padding: "8px 12px",
                                fontSize: "12px",
                            }}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <div
            className="bg-[#F6F3ED] rounded-3xl p-6 
    shadow-[0_15px_40px_rgba(0,0,0,0.06)]"
        >
            <p className="text-sm text-[#6B7C78]">{title}</p>
            <h2 className="text-2xl font-semibold text-[#3A4F4B] mt-2">
                {value}
            </h2>
        </div>
    );
}
