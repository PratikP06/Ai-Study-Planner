"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
    const [plans, setPlans] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchHistory = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const { data } = await supabase
                .from("plans")
                .select("id, plan_date, content")
                .order("plan_date", { ascending: false });

            setPlans(data || []);
        };

        fetchHistory();
    }, []);

    return (
        <main className="min-h-screen px-4 md:px-6 lg:px-8 py-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <header className="space-y-3">
                    <div className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                        Archive
                    </div>
                    <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-white text-glow">
                        Study Plan History
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Your previously generated study plans
                    </p>
                </header>

                {/* Back */}
                <button
                    onClick={() => router.push("/dashboard")}
                    className="text-sm font-medium transition text-neutral-400 hover:text-white"
                >
                    ← Dashboard
                </button>

                <div className="space-y-4">
                    {plans.map((plan) => (
                        <Link
                            key={plan.id}
                            href={`/history/${plan.id}`}
                            className="block rounded-xl border border-white/5 p-5 transition-all duration-300 bg-[#1c1b1b] hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] glow-border-resting"
                        >
                            <h2 className="font-medium text-white">
                                📅 {new Date(plan.plan_date).toDateString()}
                            </h2>

                            <p className="text-sm mt-2 line-clamp-2 text-neutral-500">
                                {plan.content.slice(0, 160)}…
                            </p>
                        </Link>
                    ))}

                    {plans.length === 0 && (
                        <p className="text-sm text-neutral-500">
                            No study plans yet.
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}
