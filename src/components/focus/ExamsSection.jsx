"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export default function ExamsSection({ userId }) {
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [examDate, setExamDate] = useState("");

  useEffect(() => {
    const fetchAndCleanData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString().slice(0, 10);

      await supabase
        .from("exams")
        .delete()
        .eq("user_id", userId)
        .lt("exam_date", todayISO);

      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", userId);

      const { data: examsData } = await supabase
        .from("exams")
        .select("*, subjects(name)")
        .eq("user_id", userId)
        .order("exam_date", { ascending: true });

      setSubjects(subjectsData || []);
      setExams(examsData || []);
    };

    fetchAndCleanData();
  }, [userId]);

  const addExam = async () => {
    if (!subjectId || !examDate) return;

    const { data, error } = await supabase
      .from("exams")
      .insert({
        user_id: userId,
        subject_id: subjectId,
        exam_date: examDate,
      })
      .select("*, subjects(name)")
      .single();

    if (error) return;

    const updated = [...exams, data].sort(
      (a, b) => new Date(a.exam_date) - new Date(b.exam_date)
    );

    setExams(updated);
    setSubjectId("");
    setExamDate("");
  };

  const deleteExam = async (id) => {
    await supabase.from("exams").delete().eq("id", id);
    setExams(exams.filter((e) => e.id !== id));
  };

  const getDaysLeft = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const exam = new Date(date);
    exam.setHours(0, 0, 0, 0);

    const diff = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `${diff} days left`;
  };

  return (
    <section className="rounded-2xl p-5 sm:p-8 bg-[#1c1b1b] border border-white/5 glow-border-resting">

      <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-white mb-6">
        Exams
      </h2>

      {/* Input Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="w-full rounded-xl px-4 py-2 bg-[#0e0e0e] border border-white/10 text-[#e5e2e1] outline-none focus:ring-1 focus:ring-white/30 transition-all"
        >
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="w-full rounded-xl px-4 py-2 bg-[#0e0e0e] border border-white/10 text-[#e5e2e1] outline-none focus:ring-1 focus:ring-white/30 transition-all"
        />

        <button
  onClick={addExam}
  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-[#1a1c1c] flex items-center justify-center hover:shadow-[0_0_12px_rgba(255,255,255,0.1)] transition-all duration-200"
>
  <FiPlus size={18} />
</button>

      </div>

      {exams.length > 0 ? (
        <ul className="space-y-4">
          {exams.map((e) => (
            <li
              key={e.id}
              className="bg-[#0e0e0e]/70 rounded-xl p-4 sm:p-5 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-wrap justify-between items-center gap-3"
            >
              <div>
                <p className="text-white font-medium">
                  {e.subjects?.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {new Date(e.exam_date).toDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/10 text-neutral-300">
                  {getDaysLeft(e.exam_date)}
                </span>

                <button
                  onClick={() => deleteExam(e.id)}
                  className="text-neutral-500 hover:text-red-400 transition"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">
          No upcoming exams
        </p>
      )}
    </section>
  );
}
