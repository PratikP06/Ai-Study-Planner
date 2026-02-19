"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/client";
import { FiTrash2 } from "react-icons/fi";

export default function TopicsPage() {
  const { id: subjectId } = useParams();
  const router = useRouter();

  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [strength, setStrength] = useState("medium");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

       
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", subjectId)
        .single();

      if (!subjectData) {
        router.push("/dashboard");
        return;
      }

      setSubject(subjectData);

       
      const { data: topicsData } = await supabase
        .from("topics")
        .select("*")
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: true });

      setTopics(topicsData || []);
      setLoading(false);
    };

    init();
  }, [subjectId, router]);

  const addTopic = async () => {
    if (!topicName) return;

    const { data, error } = await supabase
      .from("topics")
      .insert({
        subject_id: subjectId,
        name: topicName,
        strength,
      })
      .select()
      .single();

    if (!error) {
      setTopics([...topics, data]);
      setTopicName("");
      setStrength("medium");
    }
  };

  const deleteTopic = async (topicId) => {
    const { error } = await supabase
      .from("topics")
      .delete()
      .eq("id", topicId);

    if (!error) {
      setTopics(topics.filter((t) => t.id !== topicId));
    }
  };

  const strengthBadge = (s) => {
    if (s === "weak") return "bg-red-100 text-red-600";
    if (s === "medium") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[#6B7C78]">Loading topics...</p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen p-6"
      style={{ backgroundColor: "#F0EEEA" }}
    >
      <div className="max-w-xl mx-auto space-y-6">
                <button
          onClick={() => router.push("/dashboard")}
          className="text-sm hover:underline"
          style={{ color: "#6B7C78" }}
        >
          ← Back to Dashboard
        </button>

                <header>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "#3A4F4B" }}
          >
            {subject.name}
          </h1>
          <p
            className="text-sm"
            style={{ color: "#6B7C78" }}
          >
            Manage topics & strengths
          </p>
        </header>

                <div
          className="rounded-xl border p-4 space-y-3"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#D6CBBF" }}
        >
          <input
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            placeholder="Topic name"
            className="w-full border rounded p-2"
          />

          <select
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="weak">Weak</option>
            <option value="medium">Medium</option>
            <option value="strong">Strong</option>
          </select>

          <button
            onClick={addTopic}
            className="w-full py-2 rounded font-medium text-white"
            style={{ backgroundColor: "#97B3AE" }}
          >
            Add Topic
          </button>
        </div>

                <ul className="space-y-2">
          {topics.map((t) => (
            <li
              key={t.id}
              className="flex justify-between items-center border rounded p-3"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#D6CBBF" }}
            >
              <div>
                <p className="font-medium text-[#3A4F4B]">
                  {t.name}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${strengthBadge(
                    t.strength
                  )}`}
                >
                  {t.strength}
                </span>
              </div>

              <button
                onClick={() => deleteTopic(t.id)}
                className="text-gray-400 hover:text-red-600"
                title="Delete topic"
              >
                <FiTrash2 size={16} />
              </button>
            </li>
          ))}

          {topics.length === 0 && (
            <p className="text-sm text-[#6B7C78]">
              No topics added yet
            </p>
          )}
        </ul>
      </div>
    </main>
  );
}
