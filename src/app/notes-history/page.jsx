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
      <div className="min-h-screen bg-gradient-to-br from-[#f8dfd5] via-[#e1dcd4] to-[#D2E0D3]/30 flex items-center justify-center">
        <p className="text-[#3A4F4B] text-sm animate-pulse">Loading history...</p>
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
              Notes History
            </h1>
            <p className="text-sm text-[#3A4F4B]/50 mt-1">
              {notes.length} note{notes.length !== 1 ? "s" : ""} generated
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/notes")}
            className="px-5 py-2.5 rounded-full text-sm bg-[#97B3AE] text-white hover:opacity-90 transition self-start md:self-auto"
          >
            + New Note
          </button>
        </div>

        {/* NOTES LIST */}
        {notes.length === 0 ? (
          <div className="bg-[#F6F3ED] rounded-3xl p-12 shadow-[0_20px_60px_rgba(0,0,0,0.06)] text-center">
            <p className="text-[#3A4F4B]/60 text-sm">No notes generated yet.</p>
            <button
              onClick={() => router.push("/dashboard/notes")}
              className="mt-4 px-5 py-2.5 rounded-full text-sm bg-[#97B3AE] text-white hover:opacity-90 transition"
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
                className="bg-[#F6F3ED] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] cursor-pointer hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] transition-all duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <h2 className="text-base font-semibold text-[#3A4F4B]">
                    {note.topic}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-3 py-1 rounded-full bg-[#97B3AE]/20 text-[#3A4F4B]">
                      {note.level}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#97B3AE]/20 text-[#3A4F4B]">
                      {note.mode === "notes+diagram" ? "Notes + Diagram" : "Notes Only"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-[#3A4F4B]/50">
                    {new Date(note.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-[#97B3AE] text-lg">→</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}