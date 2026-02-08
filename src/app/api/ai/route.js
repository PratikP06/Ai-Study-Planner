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
        {
          error: "Subjects and topics required",
          code: "MISSING_CONTEXT",
        },
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

    const { data: existingPlan } = await supabase
      .from("plans")
      .select("id, content")
      .eq("user_id", userId)
      .eq("plan_date", today)
      .single();

    if (existingPlan && !regenerate) {
      return NextResponse.json({
        plan: existingPlan.content,
        cached: true,
      });
    }

    if (existingPlan && regenerate) {
      await supabase.from("plans").delete().eq("id", existingPlan.id);
    }

    const prompt = `
You are an expert study planner helping a college student.

IMPORTANT CONTEXT (CRITICAL):
- Current local time (IST): ${currentTimeLabel}
- Current time ISO: ${currentTimeISO}
- The plan MUST start AFTER this time
- Cover ONLY the remaining part of TODAY
- NEVER include morning or past time slots

GOAL:
Create a calm, realistic study plan for the rest of today.

STUDENT CONTEXT:
- Remaining energy: moderate
- Remaining time: ~3–5 hours
- Avoid burnout and late-night overload

SUBJECTS:
${subjects.map((s) => `- ${s.name}`).join("\n")}

TOPICS (with strength):
${topics.map((t) => `- ${t.name} (${t.strength})`).join("\n")}

EXAMS:
${exams.map((e) => `- ${e.subject}: exam in ${e.daysLeft} days`).join("\n")}

PLANNING RULES:
1. Start strictly AFTER ${currentTimeLabel}
2. No AM slots if current time is PM
3. Prioritize weak topics and nearest exams
4. 45–60 min focus blocks
5. Short breaks (5–10 min)
6. One longer break if time allows
7. End reasonably — no burnout

OUTPUT FORMAT:
- Clear time slots (e.g. 5:15–6:00 PM)
- Bullet points only
- Simple, motivating tone
- End with 2 short tips for the evening

Now generate today’s study plan.
`;

    const plan = await askGemini(prompt);

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
