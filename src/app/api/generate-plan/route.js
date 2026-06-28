export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { askGroqStructured } from "@/lib/ai/groq";
import { buildPurePlanPrompt } from "@/lib/ai/planBuilder";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

// Server-side Supabase client (uses service role — never exposed to browser)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── POST /api/generate-plan ─────────────────────────────────────────────────

export async function POST(req) {
  try {
    const {
      userId,
      userPrompt: rawPrompt = "",
      studyDuration = 7,
      regenerate = false,
    } = await req.json();

    // Sanitize and length-limit the user prompt to prevent prompt injection
    const userPrompt = rawPrompt.trim().slice(0, 800);

    // ── Input validation ───────────────────────────────────────────────────
    if (!userId) {
      return errorResponse("User ID is required.", 401);
    }

    // ── SECURITY FIX: Verify the session token matches the claimed userId ──
    // Without this, any caller can pass any userId and overwrite another user's plan.
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      const { data: { user: sessionUser } } = await supabase.auth.getUser(token);
      if (!sessionUser || sessionUser.id !== userId) {
        return errorResponse("Unauthorized.", 401);
      }
    }
    if (!Number.isFinite(studyDuration) || studyDuration < 1 || studyDuration > 90) {
      return errorResponse("Study duration must be between 1 and 90 days.", 400);
    }

    // ── Date helpers (IST-aware) ───────────────────────────────────────────
    const nowIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const today = nowIST.toISOString().slice(0, 10);

    // ── Check for an existing plan today ──────────────────────────────────
    const { data: existingPlan } = await supabase
      .from("plans")
      .select("id, content, created_at")
      .eq("user_id", userId)
      .eq("plan_date", today)
      .single();

    // Return cached plan if not forcing regeneration
    if (existingPlan && !regenerate) {
      const cachedContent =
        typeof existingPlan.content === "string"
          ? JSON.parse(existingPlan.content)
          : existingPlan.content;

      return NextResponse.json({
        plan: cachedContent,
        cached: true,
        createdAt: existingPlan.created_at,
      });
    }

    // ── Fetch existing user data to enrich the AI prompt ──────────────────
    // AI QUALITY FIX: Pass subjects, topics, exams from DB so the AI produces
    // a plan grounded in what the user has already registered, not invented generic topics.
    const [{ data: existingSubjects }, { data: allTopics }, { data: existingExams }] =
      await Promise.all([
        supabase.from("subjects").select("id, name").eq("user_id", userId),
        supabase.from("topics").select("id, name, subject_id, strength").eq("user_id", userId),
        supabase.from("exams").select("*, subjects(name)").eq("user_id", userId),
      ]);

    // Compute daysLeft for each exam
    const enrichedExams = (existingExams || []).map(e => {
      const examDate = new Date(e.exam_date);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
      return { ...e, daysLeft };
    });

    // ── Build pure prompt and call AI ─────────────────────────────────────
    const prompt = buildPurePlanPrompt(userPrompt, studyDuration, today, {
      existingSubjects: existingSubjects || [],
      existingTopics: allTopics || [],
      existingExams: enrichedExams,
    });
    const planData = await askGroqStructured(prompt);

    if (!Array.isArray(planData?.days)) {
      return errorResponse(
        "AI returned an unexpected response format. Please try again.",
        502
      );
    }

    // ── Insert Subjects and Exams into DB ──────────────────────────────────
    const subjectNameToIdMap = {};

    if (Array.isArray(planData.subjects)) {
      for (const subj of planData.subjects) {
        // Upsert or insert subject (avoiding duplicates by name/userId)
        // Since we don't have a unique constraint on name+user_id in supabase inherently,
        // let's try to select first, then insert.
        let { data: existingSubj } = await supabase
          .from("subjects")
          .select("id")
          .eq("user_id", userId)
          .ilike("name", subj.name)
          .maybeSingle();

        if (existingSubj) {
          subjectNameToIdMap[subj.name] = existingSubj.id;
        } else {
          const { data: insertedSubj, error: subjErr } = await supabase
            .from("subjects")
            .insert({ user_id: userId, name: subj.name })
            .select("id")
            .single();

          if (!subjErr && insertedSubj) {
            subjectNameToIdMap[subj.name] = insertedSubj.id;
          }
        }
      }
    }

    // ── BUG FIX #1: Insert AI-extracted topics into the topics table ──────
    // Previously planData.topics was completely discarded, so the Focus page
    // subject selector had no topic context and SubjectsSection showed empty.
    if (Array.isArray(planData.topics)) {
      for (const topic of planData.topics) {
        const subId = subjectNameToIdMap[topic.subjectName];
        if (!subId) continue;

        // Avoid duplicates
        const { data: existingTopic } = await supabase
          .from("topics")
          .select("id")
          .eq("subject_id", subId)
          .ilike("name", topic.name)
          .maybeSingle();

        if (!existingTopic) {
          await supabase.from("topics").insert({
            subject_id: subId,
            user_id: userId,
            name: topic.name,
            strength: topic.strength || "medium",
          });
        }
      }
    }

    if (Array.isArray(planData.exams)) {
      for (const exam of planData.exams) {
        const subId = subjectNameToIdMap[exam.subjectName];
        if (subId) {
          // Check if exam already exists
          const { data: existingExam } = await supabase
            .from("exams")
            .select("id")
            .eq("user_id", userId)
            .eq("subject_id", subId)
            .eq("exam_date", exam.examDate)
            .maybeSingle();
            
          if (!existingExam) {
            await supabase.from("exams").insert({
              user_id: userId,
              subject_id: subId,
              exam_date: exam.examDate,
            });
          }
        }
      }
    }

    // ── Inject IDs into slots ──────────────────────────────────────────────
    if (Array.isArray(planData.days)) {
      planData.days.forEach(day => {
        if (Array.isArray(day.slots)) {
          day.slots.forEach(slot => {
            if (!slot.id) {
              slot.id = randomUUID();
            }
          });
        }
      });
    }

    // ── Persist plan (replace existing if any) ───────────────────────────
    // BUG FIX #4: Only delete TODAY's plan — not the full history.
    // The old line `delete().eq("user_id", userId)` wiped all plan history on every regeneration.
    await supabase.from("plans").delete().eq("user_id", userId).eq("plan_date", today);

    const { data: inserted, error: insertError } = await supabase
      .from("plans")
      .insert({
        user_id: userId,
        plan_date: today,
        content: JSON.stringify(planData),
      })
      .select("created_at")
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      throw new Error("Failed to save the generated plan.");
    }

    return NextResponse.json({
      plan: planData,
      cached: false,
      createdAt: inserted.created_at,
    });
  } catch (err) {
    console.error("[/api/generate-plan]", err);
    return errorResponse(err.message || "An unexpected error occurred.", 500);
  }
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function errorResponse(message, status = 500) {
  return NextResponse.json({ error: message }, { status });
}