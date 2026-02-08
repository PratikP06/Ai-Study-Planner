"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";

import TimerSection from "@/components/timerSection/timerSection";

export default function FocusPage() {
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
        <p className="text-sm text-[#6B7C78]">
          Entering focus mode…
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 sm:px-6 py-12"
      style={{ backgroundColor: "#F0EEEA" }}
    >
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-semibold text-[#3A4F4B]">
            Focus Mode 🎧
          </h1>
          <p className="mt-1 text-sm text-[#6B7C78]">
            Choose a subject and start focusing
          </p>
        </header>

        {/* 🚨 NO SUBJECTS STATE */}
        {subjects.length === 0 ? (
          <div
            className="rounded-xl border border-[#D6D1C8]
                       bg-[#F6F3ED] p-8 text-center space-y-4"
          >
            <p className="text-[#3A4F4B] font-medium text-lg">
              No subjects yet 📚
            </p>

            <p className="text-sm text-[#6B7C78]">
              Add subjects on the dashboard to start your focus sessions.
            </p>

            <button
              onClick={() => router.push("/dashboard")}
              className="mt-2 px-6 py-2 rounded-lg
                         bg-[#97B3AE] text-white
                         font-medium hover:opacity-90 transition"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Timer Section */}
            <TimerSection subjects={subjects} userId={user.id} />

            {/* Exit */}
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-[#6B7C78] underline"
            >
              Exit focus mode
            </button>
          </>
        )}
      </div>
    </div>
  );
}
