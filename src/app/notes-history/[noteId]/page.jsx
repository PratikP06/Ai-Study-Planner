"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
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
          // Use base64 data URL to avoid tainted canvas error in html2canvas
          const base64 = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
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
    <div className="my-8 bg-white p-6 rounded-xl shadow-sm overflow-x-auto">
      <div ref={ref} />
    </div>
  );
}

// -------------------
// Main Page
// -------------------
export default function NoteDetailPage() {
  const router = useRouter();
  const { noteId } = useParams();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const notesRef = useRef(null);

  useEffect(() => {
    const fetchNote = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setNote(data);
      }

      setLoading(false);
    };

    fetchNote();
  }, [noteId]);

  const downloadAsPDF = async () => {
    if (!notesRef.current) return;

    setDownloading(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      // Wait for Mermaid base64 images to fully paint
      await new Promise((resolve) => setTimeout(resolve, 500));

      const options = {
        margin: 10,
        filename: `${note?.topic || "note"}.pdf`,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8dfd5] via-[#e1dcd4] to-[#D2E0D3]/30 flex items-center justify-center">
        <p className="text-[#3A4F4B] text-sm animate-pulse">Loading note...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8dfd5] via-[#e1dcd4] to-[#D2E0D3]/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[#3A4F4B] text-lg font-medium">Note not found.</p>
          <button
            onClick={() => router.push("/notes-history")}
            className="px-5 py-2.5 rounded-full text-sm bg-[#97B3AE] text-white hover:opacity-90 transition"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-10 py-12 bg-gradient-to-br from-[#f8dfd5] via-[#e1dcd4] to-[#D2E0D3]/30 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="bg-[#f6f3ed] rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.06)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#3A4F4B]">
              {note.topic}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs px-3 py-1 rounded-full bg-[#97B3AE]/20 text-[#3A4F4B]">
                {note.level}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-[#97B3AE]/20 text-[#3A4F4B]">
                {note.mode === "notes+diagram" ? "Notes + Diagram" : "Notes Only"}
              </span>
              <span className="text-xs text-[#3A4F4B]/50">
                {new Date(note.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={downloadAsPDF}
              disabled={downloading}
              className="px-5 py-2.5 rounded-full text-sm bg-[#97B3AE] text-white hover:opacity-90 transition disabled:opacity-60"
            >
              {downloading ? "Downloading..." : "Download as PDF"}
            </button>
            <button
              onClick={() => router.push("/notes-history")}
              className="px-5 py-2.5 rounded-full text-sm bg-[#97B3AE] text-white hover:opacity-90 transition"
            >
              ← Back to History
            </button>
          </div>
        </div>

        {/* NOTE CONTENT */}
        <div ref={notesRef} className="bg-[#F6F3ED] rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold mb-6 text-[#2F3E46]">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold mt-8 mb-4 text-[#3A4F4B] border-b border-[#E2DAD0] pb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold mt-6 mb-3 text-[#3A4F4B]">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-[15px] leading-7 mb-4 text-[#3A4F4B]">
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
                <strong className="font-semibold text-[#3A4F4B]">
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
            {note.content}
          </ReactMarkdown>
        </div>

      </div>
    </div>
  );
}