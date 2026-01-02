import { GoogleGenAI, Type } from "@google/genai";

export function createGeminiClient() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not found in environment variables");
  }

  return new GoogleGenAI({ apiKey });
}

export { Type };
