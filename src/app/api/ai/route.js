export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { askGemini } from "@/lib/ai/gemini";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // server only
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

    /* ---------------------------------------------------
       1️⃣ HARD GUARD — NEVER CALL AI WITHOUT CONTEXT
    --------------------------------------------------- */
    if (!subjects.length || !topics.length) {
      return NextResponse.json(
        {
          error: "Subjects and topics are required",
          code: "MISSING_CONTEXT",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------
       2️⃣ TIME CALCULATION (AUTHORITATIVE)
    --------------------------------------------------- */
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // Round up to next 15 minutes
    const roundedMinutes = Math.ceil(now.getMinutes() / 15) * 15;
    const startTime = new Date(now);
    startTime.setMinutes(roundedMinutes);
    startTime.setSeconds(0);

    const startTimeLabel = startTime.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    /* ---------------------------------------------------
       3️⃣ CHECK EXISTING PLAN
    --------------------------------------------------- */
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

    /* ---------------------------------------------------
       4️⃣ AI PROMPT (STRICT + SAFE)
    --------------------------------------------------- */
    const prompt = `
You are an expert study planner helping a college student.

HARD CONSTRAINTS (NON-NEGOTIABLE):
- Current time is ${startTimeLabel}
- The FIRST study block MUST start at or AFTER ${startTimeLabel}
- NEVER include any time earlier than ${startTimeLabel}
- If past times appear, the plan is INVALID

GOAL:
Create a focused, realistic study plan ONLY for the remaining part of TODAY.

STUDENT CONTEXT:
- Remaining study time today: ~3–5 hours
- Energy may be lower later in the day
- Avoid burnout and unrealistic late-night schedules

SUBJECTS:
${subjects.map((s) => `- ${s.name}`).join("\n")}

TOPICS (with strength):
${topics.map((t) => `- ${t.name} (${t.strength})`).join("\n")}

EXAMS:
${exams.map((e) => `- ${e.subject}: exam in ${e.daysLeft} days`).join("\n")}

PLANNING RULES:
1. Start strictly at or after ${startTimeLabel}
2. Weak topics first, nearest exams prioritized
3. Strong topics → quick revision only
4. 45–60 min focused blocks
5. 5–10 min short breaks
6. ONE longer break if time allows
7. Avoid very late-night study blocks

OUTPUT FORMAT:
- Clear time slots (e.g. 4:15–5:00 PM)
- Bullet points only
- Simple, motivating tone
- End with 2 short evening tips
`;

    const plan = await askGemini(prompt);

    /* ---------------------------------------------------
       5️⃣ SAVE PLAN
    --------------------------------------------------- */
    await supabase.from("plans").insert({
      user_id: userId,
      plan_date: today,
      content: plan,
    });

    return NextResponse.json({
      plan,
      cached: false,
      regenerated: regenerate,
      startTime: startTimeLabel,
    });
  } catch (err) {
    console.error("AI Planner Error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
