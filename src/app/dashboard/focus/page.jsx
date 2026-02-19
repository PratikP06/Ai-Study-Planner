"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";
import TimerSection from "@/components/timerSection/timerSection";
import { Headphones } from "lucide-react";

export default function Timer() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [subjects, setSubjects] = useState([]);
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

            const { data: subjectsData } = await supabase
                .from("subjects")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: true });

            setSubjects(subjectsData || []);
            setLoading(false);
        };

        init();
    }, [router]);

     
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F0EEEA]">
                <p className="text-sm text-[#6B7C78]">Entering focus mode…</p>
            </div>
        );
    }

    return (
       <div className="px-6 sm:px-10 py-12">

            <div className="max-w-4xl mx-auto space-y-12">
                                <header className="text-center sm:text-left space-y-2">
                    <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-semibold text-[#3A4F4B]">
                        
                        Focus Mode <Headphones size={24} className="text-[#97B3AE]" />
                    </h1>

                    <p className="text-sm sm:text-base text-[#6B7C78]">
                        Choose a subject and start focusing
                    </p>
                </header>

                                {subjects.length === 0 ? (
                    <div
                        className="rounded-3xl bg-[#C9D3E3]/70 backdrop-blur-md
            p-8 sm:p-12 text-center space-y-5
            shadow-[0_15px_40px_rgba(0,0,0,0.08)]"
                    >
                        <p className="text-lg font-medium text-[#3A4F4B]">
                            No subjects yet ??
                        </p>

                        <p className="text-sm text-[#6B7C78] max-w-md mx-auto">
                            Add subjects on the dashboard to begin your focus
                            sessions.
                        </p>

                        <button
                            onClick={() => router.push("/dashboard")}
                            className="mt-4 px-6 py-2 rounded-xl
              bg-[#97B3AE] text-white font-medium
              hover:scale-105 transition-all duration-200"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                ) : (
                    <div
                        className="rounded-3xl bg-[#C9D3E3]/70 backdrop-blur-md
            p-6 sm:p-10
            shadow-[0_15px_40px_rgba(0,0,0,0.08)]"
                    >
                        <TimerSection subjects={subjects} userId={user.id} />
                    </div>
                )}
            </div>
        </div>
    );
}
