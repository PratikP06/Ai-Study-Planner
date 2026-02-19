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
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#F0EEEA" }}
    >
      <form
        onSubmit={login}
        className="w-full max-w-sm bg-white border rounded-xl p-6 space-y-5"
        style={{ borderColor: "#D6CBBF" }}
      >
                <div className="text-center">
          <h1
            className="text-2xl font-semibold"
            style={{ color: "#3A4F4B" }}
          >
            Welcome back
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "#6B7C78" }}
          >
            Log in to continue your study plan
          </p>
        </div>

                {errmsg && (
          <p className="text-sm text-center text-red-500">
            {errmsg}
          </p>
        )}

                <div className="space-y-3">
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

                <button
          disabled={loading}
          className="w-full py-2.5 rounded-md text-sm font-medium transition disabled:opacity-60"
          style={{
            backgroundColor: "#97B3AE",
            color: "#FFFFFF",
          }}
        >
          {loading ? "Logging in…" : "Log in"}
        </button>

                <p
          className="text-sm text-center"
          style={{ color: "#6B7C78" }}
        >
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium hover:underline"
            style={{ color: "#3A4F4B" }}
          >
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
