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
    <section className="rounded-3xl p-8 bg-[#F6F3ED] border border-[#D6CBBF] shadow-[0_25px_60px_rgba(0,0,0,0.06)]">

  <h2 className="text-xl font-semibold text-[#3A4F4B] mb-6">
    Exams
  </h2>

  <div className="flex gap-3 mb-6 items-center">
    <select
      value={subjectId}
      onChange={(e) => setSubjectId(e.target.value)}
      className="flex-1 rounded-xl px-4 py-2 bg-white border border-[#D6CBBF]">
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
      className="rounded-xl px-4 py-2  bg-white border border-[#D6CBBF]" />

    <button
      onClick={addExam}
      className="text-[#97B3AE] hover:scale-110 transition"
    >
      <FiPlus size={20} />
    </button>
  </div>

  {exams.length > 0 ? (
    <ul className="space-y-4">
      {exams.map((e) => (
        <li
          key={e.id}
          className="bg-white/70 backdrop-blur-sm  rounded-2xl p-4  border border-[#D6CBBF] hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-300 flex justify-between items-center">
          <div>
            <p className="text-[#3A4F4B] font-medium">
              {e.subjects?.name}
            </p>
            <p className="text-xs text-[#6B7C78]">
              {new Date(e.exam_date).toDateString()}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#97B3AE]/70 text-[#3A4F4B]">
              {getDaysLeft(e.exam_date)}
            </span>

            <button
              onClick={() => deleteExam(e.id)}
              className="text-[#6B7C78] hover:text-red-500 transition"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-[#6B7C78]">
      No upcoming exams
    </p>
  )}
</section>

  );
}
