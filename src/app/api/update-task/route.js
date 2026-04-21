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

    // Fetch user's current plan
    const { data: userPlan, error: fetchError } = await supabase
      .from("plans")
      .select("id, content")
      .eq("user_id", userId)
      .single();

    if (fetchError || !userPlan) {
      return NextResponse.json({ error: "No active plan found" }, { status: 404 });
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

    // Locate and remove the task
    if (Array.isArray(planData.days)) {
      for (const day of planData.days) {
        if (Array.isArray(day.slots)) {
          const originalLength = day.slots.length;
          day.slots = day.slots.filter(slot =>String(slot.id) !== String(taskId));
          if (day.slots.length < originalLength) {
            taskFound = true;
            // Assuming IDs are unique globally across slots, we don't break immediately in case of duplicates,
            // though filter handles all matches anyway.
          }
        }
      }
    }

    if (!taskFound) {
      console.error(`Task ${taskId} not found in DB!`);
      return NextResponse.json({ error: "Task not found in plan" }, { status: 404 });
    }

    console.log("Task found and removed successfully!");

    // Save updated JSON back to DB
    const { error: updateError } = await supabase
      .from("plans")
      .update({ content: JSON.stringify(planData) })
      .eq("id", userPlan.id);

    if (updateError) {
      throw new Error(`Failed to update plan: ${updateError.message}`);
    }

    return NextResponse.json({ success: true, message: "Task removed successfully" });
  } catch (error) {
    console.error("[/api/update-task]", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
