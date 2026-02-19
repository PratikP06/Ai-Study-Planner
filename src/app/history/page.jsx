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
        <main
            className="min-h-screen px-4 md:px-6 lg:px-8 py-8"
            style={{ backgroundColor: "#F0EEEA" }}
        >
            <div className="max-w-5xl mx-auto space-y-6">
                                <header>
                    <h1
                        className="text-2xl font-semibold"
                        style={{ color: "#3A4F4B" }}
                    >
                        📚 Study Plan History
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: "#6B7C78" }}>
                        Your previously generated study plans
                    </p>
                </header>

                                <button
                    onClick={() => router.push("/dashboard")}
                    className="text-sm font-medium transition hover:opacity-70"
                    style={{ color: "#97B3AE" }}
                >
                    ←  Dashboard
                </button>
                <div className="space-y-4">
                    {plans.map((plan) => (
                        <Link
                            key={plan.id}
                            href={`/history/${plan.id}`}
                            className="block rounded-xl border p-4 transition hover:bg-white/60"
                            style={{
                                borderColor: "#D6CBBF",
                                backgroundColor: "#FFFFFF",
                            }}
                        >
                            <h2
                                className="font-medium"
                                style={{ color: "#3A4F4B" }}
                            >
                                📅 {new Date(plan.plan_date).toDateString()}
                            </h2>

                            <p
                                className="text-sm mt-2 line-clamp-2"
                                style={{ color: "#6B7C78" }}
                            >
                                {plan.content.slice(0, 160)}…
                            </p>
                        </Link>
                    ))}

                    {plans.length === 0 && (
                        <p className="text-sm" style={{ color: "#6B7C78" }}>
                            No study plans yet.
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}
