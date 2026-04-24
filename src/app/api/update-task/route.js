import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { userId, taskId } = await req.json();

    if (!userId || !taskId) {
      return NextResponse.json({ error: "Missing userId or taskId" }, { status: 400 });
    }

    // BUG FIX #1: Match the same plan_date filter used by the dashboard.
    // Without this, .single() can throw on 0 or >1 rows → silent 500 error,
    // task disappears from UI but DB is never updated.
    const nowIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const today = nowIST.toISOString().slice(0, 10);

    // BUG FIX #2: Use .maybeSingle() instead of .single().
    // .single() throws if no row found; .maybeSingle() returns null safely.
    const { data: userPlan, error: fetchError } = await supabase
      .from("plans")
      .select("id, content")
      .eq("user_id", userId)
      .eq("plan_date", today)
      .maybeSingle();

    if (fetchError) {
      console.error("[/api/update-task] Fetch error:", fetchError.message);
      return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
    }

    if (!userPlan) {
      return NextResponse.json({ error: "No active plan found for today" }, { status: 404 });
    }

    const planData = typeof userPlan.content === "string" 
      ? JSON.parse(userPlan.content) 
      : userPlan.content;

    console.log("-----------------------------------------");
    console.log("Received taskId:", taskId, "Type:", typeof taskId);
    if (planData?.days) {
      console.log("All slot IDs in DB:", planData.days.flatMap(d => (d.slots || []).map(s => s.id)));
    }

    let taskFound = false;
    let removedSubjectName = null;

    // Locate and remove the task — also capture which subject it belonged to
    if (Array.isArray(planData.days)) {
      for (const day of planData.days) {
        if (Array.isArray(day.slots)) {
          const removedSlot = day.slots.find(slot => String(slot.id) === String(taskId));
          if (removedSlot) {
            removedSubjectName = removedSlot.subjectName || null;
          }
          const originalLength = day.slots.length;
          day.slots = day.slots.filter(slot => String(slot.id) !== String(taskId));
          if (day.slots.length < originalLength) {
            taskFound = true;
          }
        }
      }
    }

    if (!taskFound) {
      console.error(`Task ${taskId} not found in DB!`);
      return NextResponse.json({ error: "Task not found in plan" }, { status: 404 });
    }

    console.log("Task found and removed successfully!");

    // ── Subject cleanup ────────────────────────────────────────────────────
    // After removing the slot, check if any other remaining slots still use
    // the same subject. If none do, delete it from the subjects table so it
    // disappears from the Focus page too.
    if (removedSubjectName) {
      const subjectStillNeeded = planData.days.some(day =>
        (day.slots || []).some(slot => slot.subjectName === removedSubjectName)
      );

      if (!subjectStillNeeded) {
        console.log(`No remaining tasks for "${removedSubjectName}" — cleaning up subject + exams.`);

        // 1. Look up the subject ID first (needed to delete exams)
        const { data: subjectRow } = await supabase
          .from("subjects")
          .select("id")
          .eq("user_id", userId)
          .ilike("name", removedSubjectName)
          .maybeSingle();

        if (subjectRow) {
          // 2. Delete exams referencing this subject FIRST (foreign key constraint)
          const { error: examDeleteError } = await supabase
            .from("exams")
            .delete()
            .eq("user_id", userId)
            .eq("subject_id", subjectRow.id);

          if (examDeleteError) {
            console.error("Failed to delete exams for subject:", examDeleteError.message);
          }

          // 3. Now safe to delete the subject row
          const { error: subjDeleteError } = await supabase
            .from("subjects")
            .delete()
            .eq("id", subjectRow.id);

          if (subjDeleteError) {
            console.error("Failed to delete subject:", subjDeleteError.message);
          } else {
            console.log(`Subject "${removedSubjectName}" and its exams deleted from DB.`);
          }
        }
      }
    }

    // ── Check if ALL slots are now empty ──────────────────────────────────
    const totalSlotsRemaining = planData.days.reduce(
      (sum, day) => sum + (day.slots?.length || 0), 0
    );

    if (totalSlotsRemaining === 0) {
      // All tasks done — delete the plan row entirely so refresh shows "no plan"
      const { error: deleteError } = await supabase
        .from("plans")
        .delete()
        .eq("id", userPlan.id);

      if (deleteError) {
        throw new Error(`Failed to delete completed plan: ${deleteError.message}`);
      }

      console.log("All tasks completed — plan row deleted from DB.");
      return NextResponse.json({ success: true, allCompleted: true, message: "All tasks completed, plan removed" });
    }

    // Still tasks remaining — save updated JSON back to DB
    const { error: updateError } = await supabase
      .from("plans")
      .update({ content: JSON.stringify(planData) })
      .eq("id", userPlan.id);

    if (updateError) {
      throw new Error(`Failed to update plan: ${updateError.message}`);
    }

    return NextResponse.json({ success: true, allCompleted: false, message: "Task removed successfully" });
  } catch (error) {
    console.error("[/api/update-task]", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}