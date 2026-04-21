"use client";

import { useState } from "react";
import { supabase } from "@/lib/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

     
    await supabase.from("profiles").insert({
      id: data.user.id,
      name,
    });

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden px-6 py-12">
      {/* Ambient Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Signup Card */}
      <div className="w-full max-w-md z-10">
        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-[family-name:var(--font-space-grotesk)] font-bold tracking-tighter text-white mb-2">
            StudyPlanner
          </h1>
          <p className="text-[#c6c6c6] font-[family-name:var(--font-inter)] text-sm tracking-wide">
            ENTER THE ETHEREAL WORKSPACE
          </p>
        </div>

        {/* The Card */}
        <div className="bg-[#201f1f]/60 backdrop-blur-xl p-8 md:p-10 rounded-xl shadow-[0_0_40px_0px_rgba(255,255,255,0.03)] border border-white/5 relative group">
          <div className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-white/15 transition-colors duration-500 pointer-events-none" />

          {errorMsg && (
            <p className="text-sm text-center text-red-400/90 bg-red-400/10 rounded-xl px-4 py-2 mb-6">
              {errorMsg}
            </p>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-xs font-[family-name:var(--font-inter)] uppercase tracking-widest text-[#c6c6c6] px-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full bg-[#0e0e0e] border-none rounded-lg py-4 px-4 text-[#e5e2e1] placeholder:text-neutral-600 focus:ring-1 focus:ring-white/30 focus:bg-[#1c1b1b] transition-all duration-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-[family-name:var(--font-inter)] uppercase tracking-widest text-[#c6c6c6] px-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="focus@ethereal.io"
                className="w-full bg-[#0e0e0e] border-none rounded-lg py-4 px-4 text-[#e5e2e1] placeholder:text-neutral-600 focus:ring-1 focus:ring-white/30 focus:bg-[#1c1b1b] transition-all duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-[family-name:var(--font-inter)] uppercase tracking-widest text-[#c6c6c6] px-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0e0e0e] border-none rounded-lg py-4 px-4 text-[#e5e2e1] placeholder:text-neutral-600 focus:ring-1 focus:ring-white/30 focus:bg-[#1c1b1b] transition-all duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-[#1a1c1c] font-[family-name:var(--font-space-grotesk)] font-bold py-4 rounded-xl shadow-[0_0_20px_0px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_0px_rgba(255,255,255,0.2)] active:scale-95 transition-all duration-300 ease-out disabled:opacity-50"
              >
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[#c6c6c6] font-[family-name:var(--font-inter)] text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-white font-semibold hover:underline underline-offset-4 ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
