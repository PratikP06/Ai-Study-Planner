"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";

import Hero from "@/components/landing/Hero";
import StatsBand from "@/components/landing/StatsBand";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import FeatureGrid from "@/components/landing/FeatureGrid";
import WorkflowSection from "@/components/landing/WorkflowSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import MonolithCTA from "@/components/landing/MonolithCTA";
import Footer from "@/components/landing/Footer";
import Reveal from "@/components/landing/Reveal";

export default function HomePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  return (
    <main className="text-[#e5e2e1] overflow-x-hidden font-[family-name:var(--font-manrope)] selection:bg-white selection:text-[#131313]">
      {/* Hero has its own load-in animation — not wrapped in Reveal */}
      <Hero user={user} />

      <Reveal>
        <StatsBand />
      </Reveal>

      <Reveal>
        <ProblemSection />
      </Reveal>

      <Reveal>
        <SolutionSection />
      </Reveal>

      <Reveal>
        <FeatureGrid />
      </Reveal>

      <Reveal>
        <WorkflowSection />
      </Reveal>

      <Reveal>
        <BenefitsSection />
      </Reveal>


      <Reveal>
        <MonolithCTA user={user} />
      </Reveal>

      <Footer />
    </main>
  );
}