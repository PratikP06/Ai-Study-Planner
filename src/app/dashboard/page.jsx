"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";

import SubjectsSection from "@/components/dashboad/subjectsSection";
import ExamsSection from "@/components/dashboad/ExamsSection";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

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

      const { data, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (!error && data?.name) {
        setName(data.name.toUpperCase());
      }

      setLoading(false);
    };

    init();
  }, [router]);

  if (loading) {
    return (
      <div
        className="min-h-screen px-4 sm:px-6 py-12 flex items-center justify-center"
        style={{ backgroundColor: "#F0EEEA" }}
      >
        <p className="text-sm text-[#6B7C78]">
          Loading dashboard…
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen overflow-y-auto px-4 sm:px-6 py-12 sm:py-16"
      style={{ backgroundColor: "#F0EEEA" }}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "#3A4F4B" }}
          >
            Welcome 👋 {name}
          </h1>
          <p className="mt-1 text-sm sm:text-base" style={{ color: "#6B7C78" }}>
            Manage your studies in one calm place
          </p>
        </header>

        {/* Primary CTA */}
        <div>
          <button
            onClick={() => router.push("/planner")}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition hover:opacity-90"
            style={{
              backgroundColor: "#97B3AE",
              color: "#FFFFFF",
            }}
          >
            Generate today’s study plan
          </button>
        </div>

        {/* Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          <SubjectsSection userId={user.id} />
          <ExamsSection userId={user.id} />
        </div>

        {/* bottom breathing room */}
        <div className="h-16" />
      </div>
    </div>
  );
}
