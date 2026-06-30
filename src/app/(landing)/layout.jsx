"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import LandingNav from "@/components/landing/LandingNav";

export default function LandingLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#131313]">
      <LandingNav user={user} />
      <main>{children}</main>
    </div>
  );
}