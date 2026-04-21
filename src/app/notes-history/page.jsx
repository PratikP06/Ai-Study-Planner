"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";

export default function NotesHistoryPage() {
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("id, topic, level, mode, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setNotes(data || []);
      setLoading(false);
    };

    fetchNotes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500 text-sm animate-pulse">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-10 py-12">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="bg-[#1c1b1b] rounded-2xl p-6 border border-white/5 glow-border-resting flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Archive
            </div>
            <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-space-grotesk)] font-bold tracking-tight text-white text-glow">
              Notes History
            </h1>
            <p className="text-sm text-neutral-500">
              {notes.length} note{notes.length !== 1 ? "s" : ""} generated
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/notes")}
            className="px-6 py-3 rounded-full text-sm font-bold bg-white text-[#1a1c1c] hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] transition-all self-start md:self-auto"
          >
            + New Note
          </button>
        </div>

        {/* NOTES LIST */}
        {notes.length === 0 ? (
          <div className="bg-[#1c1b1b] rounded-2xl p-12 border border-white/5 glow-border-resting text-center">
            <p className="text-neutral-500 text-sm">No notes generated yet.</p>
            <button
              onClick={() => router.push("/dashboard/notes")}
              className="mt-4 px-6 py-3 rounded-full text-sm font-bold bg-white text-[#1a1c1c] hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] transition-all"
            >
              Generate your first note
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => router.push(`/notes-history/${note.id}`)}
                className="bg-[#1c1b1b] rounded-xl p-6 border border-white/5 cursor-pointer
                  glow-border-resting glow-border-hover
                  transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <h2 className="text-base font-semibold text-white">
                    {note.topic}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-neutral-400 border border-white/5">
                      {note.level}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-neutral-400 border border-white/5">
                      {note.mode === "notes+diagram" ? "Notes + Diagram" : "Notes Only"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-neutral-500">
                    {new Date(note.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-white/30 text-lg">→</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}