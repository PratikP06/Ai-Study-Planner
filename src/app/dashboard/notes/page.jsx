"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";
import ReactMarkdown from "react-markdown";
import mermaid from "mermaid";

// -------------------
// Mermaid Component
// -------------------
function MermaidChart({ chart }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (typeof window === "undefined") return;

    const renderChart = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
        });

        const id = "mermaid-" + Math.random().toString(36).slice(2);

        const { svg } = await mermaid.render(id, chart);

        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div className="my-8 bg-white p-6 rounded-xl shadow-sm overflow-x-auto">
      <div ref={ref} />
    </div>
  );
}

// -------------------
// Main Page
// -------------------
export default function NotesPage() {
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [mode, setMode] = useState("notes");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const generateNotes = async () => {
    if (!topic || !level) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        topic,
        level,
        mode,
      }),
    });

    const data = await res.json();
    setNotes(data.notes);
    setLoading(false);
  };

  return (
    <div className="px-6 sm:px-10 py-12 bg-gradient-to-br from-[#f8dfd5] via-[#e1dcd4] to-[#D2E0D3]/30 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="bg-[#f6f3ed] rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.06)] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#3A4F4B]">
            AI Notes Generator
          </h1>

          <button
            onClick={() => router.push("/history")}
            className="px-5 py-2.5 rounded-full text-sm bg-[#97B3AE] text-white hover:opacity-90 transition"
          >
            View History
          </button>
        </div>

        {/* FORM */}
        <div className="bg-[#F6F3ED] rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold mb-6 text-[#3A4F4B]">
            Generate Notes
          </h2>

          <div className="space-y-5">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (e.g. Binary Search Tree)"
              className="w-full rounded-xl px-4 py-3 bg-white border border-[#E2DAD0] text-[#3A4F4B] focus:outline-none focus:ring-2 focus:ring-[#97B3AE]"
            />

            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="Level (e.g. B.Tech, Class 12)"
              className="w-full rounded-xl px-4 py-3 bg-white border border-[#E2DAD0] text-[#3A4F4B] focus:outline-none focus:ring-2 focus:ring-[#97B3AE]"
            />

            <div className="space-y-2">
              

              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full rounded-xl px-4 py-3 bg-white border border-[#E2DAD0] text-[#3A4F4B] focus:outline-none focus:ring-2 focus:ring-[#97B3AE]"
              >
                <option value="notes">Notes Only</option>
                <option value="notes+diagram">Notes + Diagram</option>
              </select>
            </div>

            <button
              onClick={generateNotes}
              className="w-full py-3 rounded-xl bg-[#97B3AE] text-white font-medium hover:opacity-90 transition"
            >
              {loading ? "Generating..." : "Generate Notes"}
            </button>
          </div>
        </div>

        {/* NOTES DISPLAY */}
        {notes && (
          <div className="bg-[#F6F3ED] rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold mb-6 text-[#2F3E46]">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold mt-8 mb-4 text-[#3A4F4B]  border-b border-[#E2DAD0] pb-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mt-6 mb-3 text-[#3A4F4B] ">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-[15px] leading-7 mb-4 text-[#3A4F4B] ">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-4 space-y-1 pl-2">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="text-sm leading-6 text-[#3A4F4B] pl-3 border-l-2 border-[#97B3AE]">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-[#3A4F4B] ">
                    {children}
                  </strong>
                ),

                // 🔥 MERMAID LOGIC HERE
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");

                  if (match && match[1] === "mermaid") {
                    return <MermaidChart chart={String(children)} />;
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {notes}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
