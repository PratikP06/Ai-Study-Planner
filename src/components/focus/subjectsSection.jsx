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
    <section className="rounded-2xl p-5 sm:p-8 bg-[#1c1b1b] border border-white/5 glow-border-resting">
      <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-white mb-6">Subjects</h2>

      {/* Add Subject */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={subjectInput}
          onChange={(e) => setSubjectInput(e.target.value)}
          placeholder="Add subject"
          className="w-full rounded-xl px-4 py-2 bg-[#0e0e0e] border border-white/10 text-[#e5e2e1] placeholder:text-neutral-600 outline-none focus:ring-1 focus:ring-white/30 transition-all"
        />
        <button
          onClick={addSubject}
          className="w-full sm:w-auto px-5 py-2 rounded-xl text-[#1a1c1c] font-bold bg-white hover:shadow-[0_0_12px_rgba(255,255,255,0.1)] transition-all duration-200"
        >
          Add
        </button>
      </div>

      <ul className="space-y-5">
        {subjects.map((subject) => (
          <li
            key={subject.id}
            className="bg-[#0e0e0e]/70 rounded-xl p-4 sm:p-5 border border-white/5 hover:border-white/10 transition-all duration-300"
          >
            <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
              <h3 className="font-semibold text-white text-lg">
                {subject.name}
              </h3>

              <div className="flex gap-3 items-center text-neutral-500">
                <button
                  onClick={() => router.push(`/dashboard/topics/${subject.id}`)}
                  className="hover:text-white transition"
                >
                  <FiPlus size={18} />
                </button>

                <button
                  onClick={() => deleteSubject(subject.id)}
                  className="hover:text-red-400 transition"
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
                    <span className="text-neutral-300">{topic.name}</span>

                    <div className="flex gap-3 items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          topic.strength === "weak"
                            ? "bg-red-400/15 text-red-400"
                            : topic.strength === "medium"
                              ? "bg-amber-400/15 text-amber-400"
                              : "bg-emerald-400/15 text-emerald-400"
                        }`}
                      >
                        {topic.strength}
                      </span>

                      <button
                        onClick={() => deleteTopic(topic.id)}
                        className="text-neutral-500 hover:text-red-400 transition"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-neutral-600">No topics yet</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
