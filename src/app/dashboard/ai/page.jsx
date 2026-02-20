"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/client";
import { FiRefreshCw, FiClock } from "react-icons/fi";
import { Sparkles } from "lucide-react";

export default function AIPage() {
    const router = useRouter();

    const [plan, setPlan] = useState("");
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

        const data = await res.json();

        setPlan(data.plan);
        setCached(data.cached);

        if (data.createdAt) {
            const formatted = new Date(data.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
            setGeneratedAt(formatted);
        }

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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8dfd5] via-[#e1dcd4] to-[#D2E0D3]/30">
                <p className="text-sm text-[#6B7C78]">
                    Generating your calm study plan…
                </p>
            </div>
        );
    }

    return (
       <div className="px-6 sm:px-10 py-12">

            <div className="max-w-5xl mx-auto space-y-8">
                                <div
                    className="bg-[#F6F3ED] rounded-3xl p-6 
        shadow-[0_15px_40px_rgba(0,0,0,0.06)] 
        flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                >
                    <div className="space-y-1">
                        <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-semibold text-[#3A4F4B]">
                            
                            AI Study Assistant<Sparkles size={24} className="text-[#97B3AE]" />
                        </h1>

                        <div className="flex items-center gap-2 text-sm text-[#6B7C78]">
                            <FiClock size={14} />
                            <span>
                                Generated at {generatedAt}
                                {cached && " • saved"}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => generatePlan(true)}
                            className="flex items-center gap-2 px-5 py-2.5 
              rounded-full text-sm font-medium
              bg-[#97B3AE] text-white
              hover:opacity-90 transition"
                        >
                            <FiRefreshCw size={14} />
                            Regenerate
                        </button>

                        <button
                            onClick={() => router.push("/history")}
                            className="px-5 py-2.5 rounded-full text-sm 
              border border-[#D6CBBF] text-[#3A4F4B]
              hover:bg-white transition"
                        >
                            View History
                        </button>
                    </div>
                </div>

                                <div
                    className="bg-[#F6F3ED] rounded-3xl p-8
        shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
                >
                    <ReactMarkdown
                        components={{
                            p: ({ children }) => (
                                <p className="text-sm sm:text-base leading-7 mb-4 text-[#3A4F4B]">
                                    {children}
                                </p>
                            ),
                            h2: ({ children }) => (
                                <h2 className="text-lg font-semibold mt-6 mb-3 text-[#3A4F4B]">
                                    {children}
                                </h2>
                            ),
                            li: ({ children }) => (
                                <li className="ml-5 list-disc text-sm sm:text-base leading-6 mb-2 text-[#6B7C78]">
                                    {children}
                                </li>
                            ),
                            strong: ({ children }) => (
                                <strong className="font-semibold text-[#3A4F4B]">
                                    {children}
                                </strong>
                            ),
                        }}
                    >
                        {plan}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
