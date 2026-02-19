export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { askGemini } from "@/lib/ai/gemini";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const {
      userId,
      subjects = [],
      topics = [],
      exams = [],
      regenerate = false,
    } = await req.json();

    if (!subjects.length || !topics.length) {
      return NextResponse.json(
        { error: "Subjects and topics required" },
        { status: 400 }
      );
    }

     
    const now = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })
    );

    const today = now.toISOString().slice(0, 10);

    const currentTimeLabel = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const currentTimeISO = now.toISOString();

     
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().slice(0, 10);

    const { data: yesterdayPlan } = await supabase
      .from("plans")
      .select("content")
      .eq("user_id", userId)
      .eq("plan_date", yesterdayDate)
      .single();

     
    const { data: existingPlan } = await supabase
      .from("plans")
      .select("id, content, created_at")
      .eq("user_id", userId)
      .eq("plan_date", today)
      .single();

     
    if (existingPlan && !regenerate) {
      return NextResponse.json({
        plan: existingPlan.content,
        cached: true,
        createdAt: existingPlan.created_at,
      });
    }

     
    if (existingPlan && regenerate) {
      await supabase.from("plans").delete().eq("id", existingPlan.id);
    }

     
    const prompt = `
You are an expert study coach and AI planner.

Current IST Time: ${currentTimeLabel}
Current ISO Time: ${currentTimeISO}

Use at least 60% of remaining time today.
Schedule minimum 60 minutes total.
Use 45–60 min focus blocks.
Include short breaks.

Subjects:
${subjects.map((s) => `- ${s.name}`).join("\n")}

Topics:
${topics.map((t) => `- ${t.name} (${t.strength})`).join("\n")}

Exams:
${exams.map((e) => `- ${e.subject}: exam in ${e.daysLeft} days`).join("\n")}

Yesterday:
${yesterdayPlan?.content || "No plan yesterday."}

Return structured time-based schedule with improvements over yesterday.
`;

    const plan = await askGemini(prompt);

     
    const { data: inserted } = await supabase
      .from("plans")
      .insert({
        user_id: userId,
        plan_date: today,
        content: plan,
      })
      .select("created_at")
      .single();

    return NextResponse.json({
      plan,
      cached: false,
      createdAt: inserted.created_at,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
