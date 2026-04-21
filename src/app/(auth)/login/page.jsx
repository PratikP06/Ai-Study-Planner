"use client";

import { supabase } from "@/lib/client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errmsg, setErrorMsg] = useState(null);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden px-6 py-12">
      {/* Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Login Form */}
      <section className="w-full max-w-[480px] z-10">
        <div className="glass-panel glow-border-resting rounded-2xl p-8 md:p-12 space-y-10 transition-all duration-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)] border border-white/5">
          <header className="text-center space-y-4">
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl md:text-5xl font-bold tracking-tight text-white text-glow">
              StudyPlanner
            </h1>
            <p className="text-[#c6c6c6] text-sm md:text-base tracking-wide max-w-[280px] mx-auto opacity-80">
              Enter the ethereal workspace.
            </p>
          </header>

          {errmsg && (
            <p className="text-sm text-center text-red-400/90 bg-red-400/10 rounded-xl px-4 py-2">
              {errmsg}
            </p>
          )}

          <form onSubmit={login} className="space-y-8">
            <div className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="block font-[family-name:var(--font-inter)] text-[10px] tracking-[0.2em] uppercase text-[#c6c6c6] px-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  className="w-full bg-[#0e0e0e] border border-[#474747]/30 rounded-full px-6 py-4 text-[#e5e2e1] placeholder:text-neutral-600 focus:ring-1 focus:ring-white/30 focus:border-white/30 premium-input transition-all duration-300 outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block font-[family-name:var(--font-inter)] text-[10px] tracking-[0.2em] uppercase text-[#c6c6c6] px-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[#0e0e0e] border border-[#474747]/30 rounded-full px-6 py-4 text-[#e5e2e1] placeholder:text-neutral-600 focus:ring-1 focus:ring-white/30 focus:border-white/30 premium-input transition-all duration-300 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button
                disabled={loading}
                type="submit"
                className="btn-gradient w-full py-4 rounded-full text-[#1a1c1c] font-[family-name:var(--font-inter)] text-sm font-bold tracking-[0.15em] uppercase hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.08)] disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </div>
          </form>

          <footer className="text-center">
            <p className="text-xs text-[#919191] tracking-wider">
              New to the workspace?{" "}
              <Link
                href="/signup"
                className="text-white font-medium hover:underline underline-offset-4 decoration-white/50 transition-all"
              >
                Create account
              </Link>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
