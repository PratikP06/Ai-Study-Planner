export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { askGemini } from "@/lib/ai/gemini";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // server-only
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

    // 🚫 HARD GUARD — never call AI without context
    if (!subjects.length || !topics.length) {
      return NextResponse.json(
        {
          error: "Subjects and topics required to generate plan",
          code: "MISSING_CONTEXT",
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const currentTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // 1️⃣ check existing plan
    const { data: existingPlan } = await supabase
      .from("plans")
      .select("id, content")
      .eq("user_id", userId)
      .eq("plan_date", today)
      .single();

    // 2️⃣ return cached plan if not regenerating
    if (existingPlan && !regenerate) {
      return NextResponse.json({
        plan: existingPlan.content,
        cached: true,
      });
    }

    // 3️⃣ delete old plan if regenerating
    if (existingPlan && regenerate) {
      await supabase.from("plans").delete().eq("id", existingPlan.id);
    }

    // 4️⃣ PROMPT — remaining day aware
    const prompt = `
You are an expert study planner helping a college student.

IMPORTANT CONTEXT:
- Current time: ${currentTime}
- Plan should start from NOW
- Cover ONLY the remaining part of TODAY
- Do NOT include past time slots

GOAL:
Create a focused, realistic study plan for the rest of today.

STUDENT CONTEXT:
- Available time remaining today: ~3–5 hours
- Energy may be lower later in the day
- Needs balance between weak topics, revision, and rest

SUBJECTS:
${subjects.map((s) => `- ${s.name}`).join("\n")}

TOPICS (with strength):
${topics.map((t) => `- ${t.name} (${t.strength})`).join("\n")}

EXAMS:
${exams.map((e) => `- ${e.subject}: exam in ${e.daysLeft} days`).join("\n")}

PLANNING RULES:
1. Start time slots AFTER ${currentTime}
2. Prioritize weak topics and nearest exams
3. Strong topics → quick revision only
4. 45–60 min focus blocks
5. 5–10 min short breaks
6. ONE longer break if time allows
7. Avoid late-night burnout

OUTPUT FORMAT:
- Clear time slots (e.g. 6:15–7:00 PM)
- Bullet points
- Simple, motivating tone
- End with 2 short evening tips

Now generate today’s study plan.
`;

    const plan = await askGemini(prompt);

    // 5️⃣ save plan
    await supabase.from("plans").insert({
      user_id: userId,
      plan_date: today,
      content: plan,
    });

    return NextResponse.json({
      plan,
      cached: false,
      regenerated: regenerate,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
