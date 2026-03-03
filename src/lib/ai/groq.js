"use server";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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