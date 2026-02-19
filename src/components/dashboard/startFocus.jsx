"use client";

import { useRouter } from "next/navigation";

export default function StartFocusCard() {
  const router = useRouter();

  return (
    <div className="rounded-3xl p-6 border border-[#D6CBBF] bg-gradient-to-br from-[#97B3AE] to-[#8FAFA8] text-white shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
      <h2 className="text-lg font-semibold">Ready to focus?</h2>

      <p className="text-sm mt-2 opacity-90">
        Enter focus mode and start studying
      </p>

      <button
        onClick={() => router.push("/dashboard/focus")}
        className="mt-5 px-5 py-2.5 rounded-xl bg-white text-[#3A4F4B] font-medium shadow-sm hover:scale-[1.02] transition-all duration-200"
      >
        Start Focus
      </button>
    </div>
  );
}
