"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askGemini(userPrompt) {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
    });

    return result.text || "No response text.";
  } catch (error) {
    console.error("AI Error:", error);
    return `Error: ${error.message}`;
  }
}
