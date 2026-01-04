import { GoogleGenAI, Type } from "@google/genai";

export function createGeminiClient() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not found in environment variables");
  }

  return new GoogleGenAI({ apiKey });
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = createGeminiClient();
  const response = await client.models.embedContent({
    model: "text-embedding-004",
    contents: [
      {
        parts: [{ text }],
      },
    ],
  });

  // @ts-ignore - SDK typing issue
  const values = response.embedding?.values || response.embeddings?.[0]?.values;

  if (!values) {
    throw new Error("Failed to generate embedding");
  }

  return values;
}

export { Type };
