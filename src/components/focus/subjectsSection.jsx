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
        const fetchSubjectsAndTopics = async () => {
             
            const { data: subjectsData, error: subjectError } = await supabase
                .from("subjects")
                .select("*")
                .eq("user_id", userId);

            if (subjectError) {
                console.error(subjectError);
                return;
            }

            setSubjects(subjectsData || []);

            if (!subjectsData || subjectsData.length === 0) {
                setTopicsBySubject({});
                return;
            }

             
            const subjectIds = subjectsData.map((s) => s.id);

            const { data: topicsData, error: topicError } = await supabase
                .from("topics")
                .select("*")
                .in("subject_id", subjectIds);

            if (topicError) {
                console.error(topicError);
                return;
            }

             
            const grouped = {};
            for (const topic of topicsData || []) {
                if (!grouped[topic.subject_id]) {
                    grouped[topic.subject_id] = [];
                }
                grouped[topic.subject_id].push(topic);
            }

            setTopicsBySubject(grouped);
        };

        fetchSubjectsAndTopics();
    }, [userId]);

    const addSubject = async () => {
        if (!subjectInput) return;

        const { data, error } = await supabase
            .from("subjects")
            .insert({ user_id: userId, name: subjectInput })
            .select();

        if (error) {
            console.error(error);
            return;
        }

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
        const { error } = await supabase
            .from("topics")
            .delete()
            .eq("id", topicId);

        if (error) {
            console.error(error);
            return;
        }

         
        const updated = { ...topicsBySubject };

        for (const subjectId in updated) {
            updated[subjectId] = updated[subjectId].filter(
                (t) => t.id !== topicId,
            );

             
            if (updated[subjectId].length === 0) {
                delete updated[subjectId];
            }
        }

        setTopicsBySubject(updated);
    };

    const strengthBadge = (strength) => {
        if (strength === "weak") return "bg-red-100 text-red-600";
        if (strength === "medium") return "bg-yellow-100 text-yellow-700";
        return "bg-green-100 text-green-700";
    };

    return (
        <section
            className="rounded-3xl p-8 bg-[#F6F3ED] border border-[#D6CBBF] shadow-[0_25px_60px_rgba(0,0,0,0.06)]"
        >
            <h2 className="text-xl font-semibold text-[#3A4F4B] mb-6">
                Subjects
            </h2>

                        <div className="flex gap-3 mb-6">
                <input
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    placeholder="Add subject"
                    className="flex-1 rounded-xl px-4 py-2   bg-white border border-[#D6CBBF]  focus:outline-none focus:ring-2 focus:ring-[#97B3AE]/40"            />
                <button
                    onClick={addSubject}
                    className="px-5 rounded-xl text-white font-medium bg-[#97B3AE] hover:scale-[1.03] transition-all duration-200 shadow"           >
                    Add
                </button>
            </div>

            <ul className="space-y-5">
                {subjects.map((subject) => (
                    <li
                        key={subject.id}
                        className="bg-white/70 backdrop-blur-sm    rounded-2xl p-5    border border-[#D6CBBF]   hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]   transition-all duration-300"
                    >
                                                <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-[#3A4F4B] text-lg">
                                {subject.name}
                            </h3>

                            <div className="flex gap-3 items-center text-[#6B7C78]">
                                <button
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/topics/${subject.id}`,
                                        )
                                    }
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
                                        className="flex justify-between items-center text-sm"
                                    >
                                        <span className="text-[#3A4F4B]">
                                            {topic.name}
                                        </span>

                                        <div className="flex gap-3 items-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    topic.strength === "weak"
                                                        ? "bg-[#F2C3B9]/60 text-[#8A3B3B]"
                                                        : topic.strength ===
                                                            "medium"
                                                          ? "bg-[#F0DDD6] text-[#9C7A3B]"
                                                          : "bg-[#D2E0D3]/70 text-[#3A4F4B]"
                                                }`}
                                            >
                                                {topic.strength}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    deleteTopic(topic.id)
                                                }
                                                className="text-[#6B7C78] hover:text-red-500 transition"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-[#6B7C78]">
                                No topics yet
                            </p>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
