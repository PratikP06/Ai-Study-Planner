"use server";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─── Free-form text response (used by existing routes) ───────────────────────

export async function askGroq(userPrompt) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert study coach and AI planner. Be structured and practical.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 4096,
    });

    return completion.choices[0]?.message?.content || "No response text.";
  } catch (error) {
    console.error("Groq Error:", error);
    return `Error: ${error.message}`;
  }
}

// ─── Structured JSON response (used by /api/generate-plan) ───────────────────

/**
 * Calls Groq with JSON mode enabled.
 * The prompt MUST instruct the model to return a specific JSON schema.
 * Returns a parsed JavaScript object (never a string).
 *
 * Throws on network / model errors so the caller can handle them cleanly.
 */
export async function askGroqStructured(userPrompt) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are an expert study coach and AI planner. " +
          "Always respond with valid JSON only — no markdown fences, no extra prose.",
      },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 8192,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("AI returned an empty response.");

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("AI returned malformed JSON. Please try again.");
  }
}