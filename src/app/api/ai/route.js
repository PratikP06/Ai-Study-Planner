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

    /* --------------------------------------------------
       🚫 HARD GUARD — never call AI without context
    -------------------------------------------------- */
    if (!subjects.length || !topics.length) {
      return NextResponse.json(
        {
          error: "Subjects and topics are required to generate a study plan.",
          code: "MISSING_CONTEXT",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------
       ⏱ TIME SETUP (HARD ANCHORED)
    -------------------------------------------------- */
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const startTimeISO = now.toISOString(); // machine-readable
    const startTimeLabel = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    /* --------------------------------------------------
       📦 EXISTING PLAN CHECK
    -------------------------------------------------- */
    const { data: existingPlan } = await supabase
      .from("plans")
      .select("id, content")
      .eq("user_id", userId)
      .eq("plan_date", today)
      .single();

    // Return cached plan if not regenerating
    if (existingPlan && !regenerate) {
      return NextResponse.json({
        plan: existingPlan.content,
        cached: true,
      });
    }

    // Delete old plan if regenerating
    if (existingPlan && regenerate) {
      await supabase.from("plans").delete().eq("id", existingPlan.id);
    }

    /* --------------------------------------------------
       🧠 AI PROMPT (STRICT + HARD RULES)
    -------------------------------------------------- */
    const prompt = `
You are an expert study planner.

🚨 HARD TIME CONSTRAINT (ABSOLUTE RULES):
- Current time (ISO): ${startTimeISO}
- Local time now: ${startTimeLabel}
- ALL study blocks MUST start AFTER ${startTimeLabel}
- DO NOT include any AM times
- DO NOT include any time earlier than ${startTimeLabel}
- If you do, the plan is INVALID

GOAL:
Create a focused, realistic study plan ONLY for the remaining part of TODAY.

STUDENT CONTEXT:
- Remaining energy is moderate
- Remaining study time today: ~3–5 hours
- Needs balance between weak topics, revision, and rest
- Avoid burnout or late-night overload

SUBJECTS:
${subjects.map((s) => `- ${s.name}`).join("\n")}

TOPICS (with strength):
${topics.map((t) => `- ${t.name} (${t.strength})`).join("\n")}

EXAMS:
${exams.map((e) => `- ${e.subject}: exam in ${e.daysLeft} days`).join("\n")}

PLANNING RULES:
1. Start ALL time slots AFTER ${startTimeLabel}
2. Prioritize weak topics and nearest exams
3. Strong topics → quick revision only
4. Use 45–60 minute focus blocks
5. Insert 5–10 minute breaks
6. ONE longer break if time allows
7. Do NOT extend late into the night unrealistically

EXAMPLE FORMAT (DO NOT COPY EXACTLY):
- ${startTimeLabel} – ${new Date(
      now.getTime() + 45 * 60000
    ).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}: First focused study block

OUTPUT FORMAT:
- Bullet points
- Clear time slots
- Simple, motivating tone
- End with 2 short evening tips

Now generate the plan.
`;

    /* --------------------------------------------------
       🤖 CALL AI
    -------------------------------------------------- */
    const plan = await askGemini(prompt);

    /* --------------------------------------------------
       🚨 HARD VALIDATION (NO TRUSTING LLMs)
    -------------------------------------------------- */
    const invalidAMRegex = /\b(0?[1-9]|1[0-1]):\d{2}\s?(AM|am)\b/;

    if (invalidAMRegex.test(plan)) {
      console.error("❌ Invalid plan generated (contains AM time)");

      return NextResponse.json(
        {
          error:
            "Invalid plan generated. Please regenerate (AI returned past times).",
          code: "INVALID_TIME_OUTPUT",
        },
        { status: 422 }
      );
    }

    /* --------------------------------------------------
       💾 SAVE PLAN
    -------------------------------------------------- */
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
    console.error("AI API ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
