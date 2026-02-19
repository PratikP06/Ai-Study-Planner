"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";

import SubjectsSection from "@/components/focus/subjectsSection";
import ExamsSection from "@/components/focus/ExamsSection";

import TodayFocusCard from "@/components/dashboard/todayStats";
import FocusStreakCard from "@/components/dashboard/streak";
import StartFocusCard from "@/components/dashboard/startFocus";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0DDD6] via-[#F0EEEA] to-[#D2E0D3]/40">
        <p className="text-sm text-[#6B7C78]">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-10 py-12">

      <div className="max-w-6xl mx-auto space-y-12">

                <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#3A4F4B]">
            Welcome {name} !!!
          </h1>
          <p className="text-[#6B7C78]">
            Manage your studies in one calm place
          </p>
        </header>

                <section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TodayFocusCard userId={user.id} />
            <FocusStreakCard userId={user.id} />
            <StartFocusCard />
          </div>
        </section>

                <section className="grid gap-6 lg:grid-cols-2">
          <SubjectsSection userId={user.id} />
          <ExamsSection userId={user.id} />
        </section>

      </div>
    </div>
  );
}
