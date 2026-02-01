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

    // create profile
    await supabase.from("profiles").insert({
      id: data.user.id,
      name,
    });

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#F0EEEA" }}
    >
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm bg-white border rounded-xl p-6 space-y-5"
        style={{ borderColor: "#D6CBBF" }}
      >
        {/* Header */}
        <div className="text-center">
          <h1
            className="text-2xl font-semibold"
            style={{ color: "#3A4F4B" }}
          >
            Create your account
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "#6B7C78" }}
          >
            Start planning your studies calmly
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <p className="text-sm text-center text-red-500">
            {errorMsg}
          </p>
        )}

        {/* Inputs */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            className="w-full p-2.5 rounded-md border text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: "#D6CBBF" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2.5 rounded-md border text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: "#D6CBBF" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2.5 rounded-md border text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: "#D6CBBF" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Button */}
        <button
          disabled={loading}
          className="w-full py-2.5 rounded-md text-sm font-medium transition disabled:opacity-60"
          style={{
            backgroundColor: "#97B3AE",
            color: "#FFFFFF",
          }}
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>

        {/* Footer */}
        <p
          className="text-sm text-center"
          style={{ color: "#6B7C78" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium hover:underline"
            style={{ color: "#3A4F4B" }}
          >
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
