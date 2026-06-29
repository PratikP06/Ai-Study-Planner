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
          theme: "dark",
          securityLevel: "loose",
        });

        const id = "mermaid-" + Math.random().toString(36).slice(2);
        const { svg } = await mermaid.render(id, chart);

        if (ref.current) {
          const base64 =
            "data:image/svg+xml;base64," +
            btoa(unescape(encodeURIComponent(svg)));
          const img = document.createElement("img");
          img.src = base64;
          img.style.maxWidth = "100%";
          ref.current.innerHTML = "";
          ref.current.appendChild(img);
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div className="my-8 bg-[#0e0e0e] p-6 rounded-xl border border-white/5 overflow-x-auto">
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
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [fromCache, setFromCache] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const notesRef = useRef(null);

  // Restore last note on page mount
  useEffect(() => {
    const restoreLastNote = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setInitialLoading(false);
        return;
      }

      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setTopic(data.topic);
        setLevel(data.level);
        setMode(data.mode);
        setNotes(data.content);
      }

      setInitialLoading(false);
    };

    restoreLastNote();
  }, []);

  const generateNotes = async () => {
    if (!topic || !level) return;

    setLoading(true);
    setError("");
    setFromCache(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // API route handles both caching + saving — no Supabase insert needed here
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, topic, level, mode }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    setNotes(data.notes);
    setFromCache(data.fromCache);
    setLoading(false);
  };

  const downloadAsPDF = async () => {
    if (!notesRef.current) return;

    setDownloading(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      await new Promise((resolve) => setTimeout(resolve, 500));

      const options = {
        margin: 10,
        filename: `${topic || "notes"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(options).from(notesRef.current).save();
    } catch (err) {
      console.error("PDF download error:", err);
    }

    setDownloading(false);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500 text-sm animate-pulse">
          Loading your notes...
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-10 py-12">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="bg-[#1c1b1b] rounded-2xl p-6 border border-white/5 glow-border-resting flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Knowledge Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-space-grotesk)] font-bold tracking-tight text-white text-glow">
              AI Notes Generator
            </h1>
          </div>
          <button
            onClick={() => router.push("/notes-history")}
            className="px-6 py-3 rounded-full text-sm font-bold bg-white text-[#1a1c1c] hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] transition-all self-start md:self-auto"
          >
            View History
          </button>
        </div>

        {/* FORM */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8 border border-white/5 glow-border-resting">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold mb-6 text-white">
            Generate Notes
          </h2>

          <div className="space-y-5">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (e.g. Binary Search Tree)"
              className="w-full rounded-xl px-4 py-3 bg-[#0e0e0e] border border-white/10 text-[#e5e2e1] placeholder:text-neutral-600 outline-none focus:ring-1 focus:ring-white/30 transition-all"
            />
            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="Level (e.g. B.Tech, Class 12)"
              className="w-full rounded-xl px-4 py-3 bg-[#0e0e0e] border border-white/10 text-[#e5e2e1] placeholder:text-neutral-600 outline-none focus:ring-1 focus:ring-white/30 transition-all"
            />
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-[#0e0e0e] border border-white/10 text-[#e5e2e1] outline-none focus:ring-1 focus:ring-white/30 transition-all"
            >
              <option value="notes">Notes Only</option>
              <option value="notes+diagram">Notes + Diagram</option>
            </select>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={generateNotes}
                disabled={loading}
                className="px-6 py-3 rounded-full text-sm font-bold bg-white text-[#1a1c1c] hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] transition-all disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Notes"}
              </button>

              {notes && (
                <button
                  onClick={downloadAsPDF}
                  disabled={downloading}
                  className="px-6 py-3 rounded-full text-sm font-medium border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  {downloading ? "Downloading..." : "Download as PDF"}
                </button>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-400 mt-2 text-center">{error}</p>
            )}
          </div>
        </div>

        {/* NOTES DISPLAY */}
        {notes && (
          <div
            ref={notesRef}
            className="bg-[#1c1b1b] rounded-2xl p-8 border border-white/5 glow-border-resting"
          >
            {/* Cache badge */}
            {fromCache && (
              <div className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-neutral-400 text-xs border border-white/5">
                ⚡ Loaded from cache
              </div>
            )}

            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold mb-6 text-white font-[family-name:var(--font-space-grotesk)]">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold mt-8 mb-4 text-white border-b border-white/10 pb-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mt-6 mb-3 text-white">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-[15px] leading-7 mb-4 text-[#c6c6c6]">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-4 space-y-1 pl-2">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="text-sm leading-6 text-[#c6c6c6] pl-3 border-l-2 border-white/20">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),
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