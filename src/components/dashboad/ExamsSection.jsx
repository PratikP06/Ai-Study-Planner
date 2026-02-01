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
    const fetchData = async () => {
      // fetch subjects
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", userId);

      // fetch exams (sorted)
      const { data: examsData } = await supabase
        .from("exams")
        .select("*, subjects(name)")
        .eq("user_id", userId)
        .order("exam_date", { ascending: true });

      setSubjects(subjectsData || []);
      setExams(examsData || []);
    };

    fetchData();
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
    const { error } = await supabase
      .from("exams")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setExams(exams.filter((e) => e.id !== id));
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

      {/* Add exam */}
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
              <span style={{ color: "#3A4F4B" }}>
                {e.subjects?.name}
                <span style={{ color: "#6B7C78" }}>
                  {" "}· {e.exam_date}
                </span>
              </span>

              <button
                onClick={() => deleteExam(e.id)}
                title="Delete exam"
                className="transition hover:text-red-600"
                style={{ color: "#6B7C78" }}
              >
                <FiTrash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm" style={{ color: "#6B7C78" }}>
          No exams added yet
        </p>
      )}
    </section>
  );
}
