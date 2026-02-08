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

      // 🧹 1️⃣ Delete past exams
      await supabase
        .from("exams")
        .delete()
        .eq("user_id", userId)
        .lt("exam_date", todayISO);

      // 📚 2️⃣ Fetch subjects
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", userId);

      // 📅 3️⃣ Fetch upcoming exams (sorted)
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

    if (error) {
      console.error(error);
      return;
    }

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

    const diff = Math.ceil(
      (exam - today) / (1000 * 60 * 60 * 24)
    );

    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `${diff} days left`;
  };

  return (
    <section
      className="rounded-xl border p-5"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#D6CBBF" }}
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: "#3A4F4B" }}
      >
        📅 Exams
      </h2>

      
      <div className="flex gap-2 mb-4 items-center">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="flex-1 border rounded p-2 text-sm"
          style={{ borderColor: "#D6CBBF" }}
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
          className="border rounded p-2 text-sm"
          style={{ borderColor: "#D6CBBF" }}
        />

        <button
          onClick={addExam}
          title="Add exam"
          className="transition hover:opacity-80"
          style={{ color: "#97B3AE" }}
        >
          <FiPlus size={20} />
        </button>
      </div>

      {/* Exams list */}
      {exams.length > 0 ? (
        <ul className="space-y-2">
          {exams.map((e) => (
            <li
              key={e.id}
              className="flex justify-between items-center rounded p-2 text-sm"
              style={{ border: "1px solid #D6CBBF" }}
            >
              <div>
                <p style={{ color: "#3A4F4B" }}>
                  {e.subjects?.name}
                </p>
                <p className="text-xs" style={{ color: "#6B7C78" }}>
                  {new Date(e.exam_date).toDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: "#97B3AE",
                    color: "#3A4F4B",
                  }}
                >
                  {getDaysLeft(e.exam_date)}
                </span>

                <button
                  onClick={() => deleteExam(e.id)}
                  title="Delete exam"
                  className="transition hover:text-red-600"
                  style={{ color: "#6B7C78" }}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm" style={{ color: "#6B7C78" }}>
          No upcoming exams 🎉
        </p>
      )}
    </section>
  );
}
