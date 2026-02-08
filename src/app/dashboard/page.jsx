"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";

// Existing sections
import SubjectsSection from "@/components/focus/subjectsSection";
import ExamsSection from "@/components/focus/ExamsSection";

// Focus overview components
import TodayFocusCard from "@/components/dashboad/todayStats";
import FocusStreakCard from "@/components/dashboad/streak";
import StartFocusCard from "@/components/dashboad/startFocus";

export default function Dashboard() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);

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

            setLoading(false);
        };

        init();
    }, [router]);

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center px-4"
                style={{ backgroundColor: "#F0EEEA" }}
            >
                <p className="text-sm text-[#6B7C78]">Loading dashboard…</p>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen overflow-y-auto px-4 sm:px-6 py-10 sm:py-14"
            style={{ backgroundColor: "#F0EEEA" }}
        >
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <header className="space-y-1">
                    <h1
                        className="text-2xl sm:text-3xl font-semibold"
                        style={{ color: "#3A4F4B" }}
                    >
                        Welcome 👋 {name}
                    </h1>
                    <p
                        className="text-sm sm:text-base"
                        style={{ color: "#6B7C78" }}
                    >
                        Manage your studies in one calm place
                    </p>
                </header>

                {/* 🔥 Focus Overview */}
                <section className="space-y-4">
                    <h2
                        className="text-lg font-semibold"
                        style={{ color: "#3A4F4B" }}
                    >
                        Focus
                    </h2>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <TodayFocusCard userId={user.id} />
                        <FocusStreakCard userId={user.id} />
                        <StartFocusCard />
                    </div>
                </section>

                {/* Subjects & Exams */}
                <section className="grid gap-6 lg:grid-cols-2">
                    <SubjectsSection userId={user.id} />
                    <ExamsSection userId={user.id} />
                </section>

                {/* 🧠 AI STUDY PLANNER CTA */}
                <section
                    className="py-16 sm:py-20"
                    style={{
                        background:"linear-gradient(180deg, #F0EEEA 0%, #F6F3ED 100%)",
                    }}
                >
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <p
                            className="text-sm font-medium uppercase tracking-widest"
                            style={{ color: "#6B7C78" }}
                        >
                            AI Study Planner
                        </p>

                        <h2
                            className="text-3xl sm:text-4xl font-semibold leading-tight"
                            style={{ color: "#3A4F4B" }}
                        >
                            Not sure what to study today?
                        </h2>

                        <p className="text-base sm:text-lg text-[#6B7C78]">
                            Let your AI planner create a balanced study plan
                            based on your subjects, weak areas, and upcoming
                            exams — so you can focus with clarity.
                        </p>

                        <div className="pt-4">
                            <button
                                onClick={() => router.push("/planner")}
                                className="px-10 py-4 rounded-xl text-base sm:text-lg
                   font-medium transition hover:opacity-90"
                                style={{
                                    backgroundColor: "#97B3AE",
                                    color: "#FFFFFF",
                                }}
                            >
                                Generate AI study plan
                            </button>
                        </div>
                    </div>
                </section>

                {/* Bottom spacing */}
                <div className="h-8" />
            </div>
        </div>
    );
}
