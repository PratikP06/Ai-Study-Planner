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

    // 🔁 Fetch yesterday's plan
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

    // 🔥 STRONG PROMPT
    const prompt = `
You are an expert study coach and AI planner.

CRITICAL TIME CONTEXT:
- Current local time (IST): ${currentTimeLabel}
- Current ISO time: ${currentTimeISO}
- Plan must start strictly AFTER this time
- Cover ONLY the remaining part of TODAY

UTILIZATION RULES (MANDATORY):
- Use AT LEAST 60% of the remaining available time today
- Schedule AT LEAST 60 minutes of total study time
- Prefer 2 or more study sessions per subject when possible
- Avoid shallow plans or minimal schedules

STUDENT CONTEXT:
- Energy level: moderate
- Goal: make meaningful progress, not just "touch topics"
- Avoid burnout, but also avoid underutilizing time

SUBJECTS:
${subjects.map((s) => `- ${s.name}`).join("\n")}

TOPICS (with strength):
${topics.map((t) => `- ${t.name} (${t.strength})`).join("\n")}

EXAMS:
${exams.map((e) => `- ${e.subject}: exam in ${e.daysLeft} days`).join("\n")}

YESTERDAY'S PLAN (FOR REFLECTION ONLY):
${yesterdayPlan?.content || "No plan yesterday."}

PLANNING RULES:
1. Prioritize weak topics and closer exams
2. Use 45–60 minute focused study blocks
3. Include 5–10 min short breaks
4. One longer break if total study exceeds 3 hours
5. If few topics exist for a subject, go DEEP (methods, practice, revision)
6. Do NOT repeat yesterday's structure blindly — improve upon it
7. End at a reasonable time (no late-night overload)

OUTPUT FORMAT (STRICT):
1. Time-based schedule (e.g. 6:15–7:00 PM)
2. For EACH study block include:
   - Topic focus
   - HOW to study (steps)
   - What success looks like
3. End with:
   - Why this plan is better than yesterday
   - 2 short evening tips

Tone: calm, precise, mentor-like.
Do NOT be generic.

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
