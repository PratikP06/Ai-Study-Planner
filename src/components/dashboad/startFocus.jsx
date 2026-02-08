"use client";

import { useRouter } from "next/navigation";

export default function StartFocusCard() {
  const router = useRouter();

  return (
    <div className="rounded-xl p-6 bg-[#97B3AE] text-white">
      <h2 className="text-lg font-semibold">Ready to focus?</h2>
      <p className="text-sm mt-1 opacity-90">
        Enter focus mode and start studying
      </p>

      <button
        onClick={() => router.push("/focus")}
        className="mt-4 px-5 py-2 rounded-lg bg-white text-[#3A4F4B] font-medium"
      >
        Start Focus
      </button>
    </div>
  );
}
