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
            // 1️⃣ Fetch subjects owned by user
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

            // 2️⃣ Fetch topics that belong to those subjects
            const subjectIds = subjectsData.map((s) => s.id);

            const { data: topicsData, error: topicError } = await supabase
                .from("topics")
                .select("*")
                .in("subject_id", subjectIds);

            if (topicError) {
                console.error(topicError);
                return;
            }

            // 3️⃣ Group topics by subject_id
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

        // also remove its topics from UI state
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

        // update UI state
        const updated = { ...topicsBySubject };

        for (const subjectId in updated) {
            updated[subjectId] = updated[subjectId].filter(
                (t) => t.id !== topicId,
            );

            // optional cleanup if no topics left
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
            className="rounded-xl border p-5"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#D6CBBF" }}
        >
            <h2
                className="text-lg font-semibold mb-4"
                style={{ color: "#3A4F4B" }}
            >
                📚 Subjects
            </h2>

            {/* Add subject */}
            <div className="flex gap-2 mb-4">
                <input
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    placeholder="Add subject"
                    className="flex-1 border rounded p-2"
                    style={{ borderColor: "#D6CBBF" }}
                />
                <button
                    onClick={addSubject}
                    className="px-4 rounded text-white transition hover:opacity-90"
                    style={{ backgroundColor: "#97B3AE" }}
                >
                    Add
                </button>
            </div>

            <ul className="space-y-4">
                {subjects.map((subject) => (
                    <li
                        key={subject.id}
                        className="rounded-lg p-3"
                        style={{ border: "1px solid #D6CBBF" }}
                    >
                        {/* Subject header */}
                        <div className="flex justify-between items-center mb-2">
                            <h3
                                className="font-medium"
                                style={{ color: "#3A4F4B" }}
                            >
                                {subject.name}
                            </h3>

                            <div className="flex gap-3 items-center">
                                <button
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/topics/${subject.id}`,
                                        )
                                    }
                                    title="Manage topics"
                                    className="transition"
                                    style={{ color: "#6B7C78" }}
                                >
                                    <FiPlus size={18} />
                                </button>

                                <button
                                    onClick={() => deleteSubject(subject.id)}
                                    title="Delete subject"
                                    className="transition hover:text-red-600"
                                    style={{ color: "#6B7C78" }}
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Topics */}
                        {topicsBySubject[subject.id]?.length > 0 ? (
                            <ul className="space-y-1">
                                {topicsBySubject[subject.id].map((topic) => (
                                    <li
                                        key={topic.id}
                                        className="flex justify-between items-center text-sm"
                                    >
                                        <span style={{ color: "#3A4F4B" }}>
                                            {topic.name}
                                        </span>

                                        <div className="flex gap-2 items-center">
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs font-medium ${strengthBadge(
                                                    topic.strength,
                                                )}`}
                                            >
                                                {topic.strength}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    deleteTopic(topic.id)
                                                }
                                                className="transition hover:text-red-600"
                                                style={{ color: "#6B7C78" }}
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs" style={{ color: "#6B7C78" }}>
                                No topics yet
                            </p>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
