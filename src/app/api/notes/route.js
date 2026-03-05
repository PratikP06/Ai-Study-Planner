export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { askGroq } from "@/lib/ai/groq";
import { createClient } from "@supabase/supabase-js";

// Use service role key here so we can bypass RLS for cache lookups
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { userId, topic, level, mode = "notes" } = await req.json();

    if (!topic || !level) {
      return NextResponse.json(
        { error: "Topic and level required" },
        { status: 400 }
      );
    }

    // -------------------
    // 1. Check DB Cache
    // -------------------
    const { data: cached } = await supabase
      .from("notes")
      .select("content")
      .ilike("topic", topic.trim())   // case-insensitive match
      .ilike("level", level.trim())
      .eq("mode", mode)
      .limit(1)
      .single();

    if (cached) {
      // Cache hit — save a copy for this user and return
      await supabase.from("notes").insert({
        user_id: userId,
        topic: topic.trim(),
        level: level.trim(),
        mode,
        content: cached.content,
      });

      return NextResponse.json({ notes: cached.content, fromCache: true });
    }

    // -------------------
    // 2. Cache Miss — Generate with AI
    // -------------------
    let prompt = `
You are an expert academic tutor and technical writer.

Generate comprehensive ${level}-level study notes on: "${topic}"

STRICT FORMATTING RULES:
- Use clean Markdown only
- NO emojis anywhere
- NO ### triple-hash headings — use ## for sections and bold text for sub-points
- NO filler phrases like "In conclusion" or "It is important to note"
- Be direct, dense, and academic in tone

Follow this exact structure:

# [Topic Name]

## Overview
2-3 sentence definition and real-world relevance.

## Detailed Explanation
In-depth explanation with examples. Use analogies where helpful.

## Core Concepts
For each sub-concept use **Bold Title** followed by explanation on the next line.

## Key Points
- Crisp, exam-relevant bullet points only

## Worked Example
Step-by-step walkthrough of a representative problem or use case.

## Exam Questions

**2-Mark Questions**
1. [question] — **Answer:** [concise answer]

**5-Mark Questions**
1. [question]
   **Answer:** [4-6 line structured answer]

**Long Answer (10 Marks)**
1. [question]
   **Answer hint:** [key points to cover]

## References
Standard textbooks or resources for ${level} level
`;

    if (mode === "notes+diagram") {
      prompt += `

## 📊 Diagram Instructions

Insert ONE detailed Mermaid.js diagram that matches **textbook/academic style** — meaning:
- Show ALL major components, not just a simple linear flow
- Use **labeled arrows** (-->|label|) to describe relationships, not just connections
- Show feedback loops and bidirectional relationships where they exist in the topic
- Group related nodes logically (top-to-bottom hierarchy like a textbook figure)
- Include 8-14 nodes for sufficient detail

STRICT MERMAID SYNTAX RULES:
1. Use \`graph TD\` (top-down) layout
2. Node IDs: plain alphanumeric ONLY — A, B, Node1, PerformElem (NO spaces, NO special chars)
3. Node labels inside square brackets ONLY: A[Label Text]
4. Labeled arrows: A -->|action or data flow| B
5. NO parentheses () inside any label — square brackets [] only
6. Every node used in an arrow MUST be declared
7. For subgraphs (grouped boxes like "Learning Agents"):
   subgraph GroupName[Group Title]
     NodeA
     NodeB
   end

Example of CORRECT textbook-style diagram for "Learning Agent":
\`\`\`mermaid
graph TD
    Env[Environment] -->|input/percept| Sensors[Sensors]
    Sensors -->|percept| Critic[Critic]
    Sensors -->|percept| PerfElem[Performance Element]
    PerfStd[Performance Standard] --> Critic
    Critic -->|feedback| LearnElem[Learning Element]
    LearnElem -->|changes| PerfElem
    LearnElem -->|learning goals| ProbGen[Problem Generator]
    ProbGen -->|problems| PerfElem
    LearnElem -->|knowledge| PerfElem
    PerfElem -->|action| Effectors[Effectors]
    Effectors -->|output/action| Env
\`\`\`

Make the diagram specific to "${topic}" — not generic.

Model it after how this topic's diagram appears in a university textbook.
Use the actual component names from the topic (not placeholders like A, B, C).
Return ONLY clean Markdown. No extra explanation outside the structure.
`;
    }

    const notes = await askGroq(prompt);

    // -------------------
    // 3. Save to DB
    // -------------------
    const { error } = await supabase.from("notes").insert({
      user_id: userId,
      topic: topic.trim(),
      level: level.trim(),
      mode,
      content: notes,
    });

    if (error) {
      console.error("Failed to save notes:", error.message);
    }

    return NextResponse.json({ notes, fromCache: false });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}