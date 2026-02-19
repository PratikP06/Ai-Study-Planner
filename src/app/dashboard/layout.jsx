"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";

import Navbar from "@/components/navbar";
import Sidebar from "@/components/dashboard/sidebar";
import MobileNav from "@/components/dashboard/mobilenav";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
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

      if (profile?.name) setName(profile.name);

      setLoading(false);
    };

    init();
  }, [router]);

  if (loading) return null;

  return (
    <div
      className="flex min-h-screen 
      bg-gradient-to-br 
      from-[#F0DDD6] via-[#F0EEEA] to-[#D2E0D3]/40"
    >
      <Navbar />

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        name={name}
        user={user}
      />

      <main
        className={`flex-1 transition-all duration-300 overflow-y-auto
        pt-20 pb-16 md:pt-0 md:pb-0
        ${collapsed ? "md:ml-20" : "md:ml-64"}`}
      >
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
