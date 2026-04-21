"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import Hero from "@/components/landing/Hero";
import FeatureGrid from "@/components/landing/FeatureGrid";
import MonolithCTA from "@/components/landing/MonolithCTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  return (
    <main className="text-[#e5e2e1] overflow-x-hidden font-[family-name:var(--font-manrope)] selection:bg-white selection:text-[#1a1c1c]">
      <Hero user={user} />
      <FeatureGrid />
      <MonolithCTA user={user} />
      <Footer />
    </main>
  );
}
