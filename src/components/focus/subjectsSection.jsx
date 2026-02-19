"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import { useRouter } from "next/navigation";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export default function SubjectsSection({ userId }) {
  const router = useRouter();
  const [subjectInput, setSubjectInput] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [topicsBySubject, setTopicsBySubject] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", userId);

      setSubjects(subjectsData || []);

      if (!subjectsData?.length) return;

      const subjectIds = subjectsData.map((s) => s.id);

      const { data: topicsData } = await supabase
        .from("topics")
        .select("*")
        .in("subject_id", subjectIds);

      const grouped = {};
      for (const topic of topicsData || []) {
        if (!grouped[topic.subject_id]) grouped[topic.subject_id] = [];
        grouped[topic.subject_id].push(topic);
      }

      setTopicsBySubject(grouped);
    };

    fetchData();
  }, [userId]);

  const addSubject = async () => {
    if (!subjectInput) return;

    const { data } = await supabase
      .from("subjects")
      .insert({ user_id: userId, name: subjectInput })
      .select();

    setSubjects([...subjects, data[0]]);
    setSubjectInput("");
  };

  const deleteSubject = async (id) => {
    await supabase.from("subjects").delete().eq("id", id);
    setSubjects(subjects.filter((s) => s.id !== id));

    const updated = { ...topicsBySubject };
    delete updated[id];
    setTopicsBySubject(updated);
  };

  const deleteTopic = async (topicId) => {
    await supabase.from("topics").delete().eq("id", topicId);

    const updated = { ...topicsBySubject };

    for (const subjectId in updated) {
      updated[subjectId] = updated[subjectId].filter((t) => t.id !== topicId);
    }

    setTopicsBySubject(updated);
  };

  return (
    <section className="rounded-3xl p-5 sm:p-8 bg-[#F6F3ED] border border-[#D6CBBF] shadow-[0_25px_60px_rgba(0,0,0,0.06)]">
      <h2 className="text-xl font-semibold text-[#3A4F4B] mb-6">Subjects</h2>

      {/* Responsive Add Subject */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={subjectInput}
          onChange={(e) => setSubjectInput(e.target.value)}
          placeholder="Add subject"
          className="w-full rounded-xl px-4 py-2 bg-white border border-[#D6CBBF] focus:outline-none focus:ring-2 focus:ring-[#97B3AE]/40"
        />
        <button
          onClick={addSubject}
          className="w-full sm:w-auto px-5 py-2 rounded-xl text-white font-medium bg-[#97B3AE] hover:scale-[1.02] transition-all duration-200 shadow"
        >
          Add
        </button>
      </div>

      <ul className="space-y-5">
        {subjects.map((subject) => (
          <li
            key={subject.id}
            className="bg-white/70 rounded-2xl p-4 sm:p-5 border border-[#D6CBBF] hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-300"
          >
            <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
              <h3 className="font-semibold text-[#3A4F4B] text-lg">
                {subject.name}
              </h3>

              <div className="flex gap-3 items-center text-[#6B7C78]">
                <button
                  onClick={() => router.push(`/dashboard/topics/${subject.id}`)}
                  className="hover:text-[#3A4F4B] transition"
                >
                  <FiPlus size={18} />
                </button>

                <button
                  onClick={() => deleteSubject(subject.id)}
                  className="hover:text-red-500 transition"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>

            {topicsBySubject[subject.id]?.length > 0 ? (
              <ul className="space-y-2">
                {topicsBySubject[subject.id].map((topic) => (
                  <li
                    key={topic.id}
                    className="flex flex-wrap justify-between items-center gap-2 text-sm"
                  >
                    <span className="text-[#3A4F4B]">{topic.name}</span>

                    <div className="flex gap-3 items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          topic.strength === "weak"
                            ? "bg-[#F2C3B9]/60 text-[#8A3B3B]"
                            : topic.strength === "medium"
                              ? "bg-[#F0DDD6] text-[#9C7A3B]"
                              : "bg-[#D2E0D3]/70 text-[#2F5E4E]"
                        }`}
                      >
                        {topic.strength}
                      </span>

                      <button
                        onClick={() => deleteTopic(topic.id)}
                        className="text-[#6B7C78] hover:text-red-500 transition"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#6B7C78]">No topics yet</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
