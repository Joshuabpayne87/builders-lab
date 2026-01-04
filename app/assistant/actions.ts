"use server";

import { createGeminiClient } from "@/lib/gemini";
import { KnowledgeService } from "@/lib/knowledge-service";

export async function chatWithAgent(message: string, history: { role: string; content: string }[]) {
  try {
    // 1. Search Knowledge Base for relevant context
    let context = "";
    try {
      const results = await KnowledgeService.search(message, 5, 0.6);
      if (results && results.length > 0) {
        context = `\n\nRELEVANT USER DATA (Use this to answer):\n${results
          .map((r: any) => `- [${r.source_app}]: ${r.content}`)
          .join("\n")}`;
      }
    } catch (e) {
      console.warn("Failed to retrieve knowledge context:", e);
      // Continue without context if search fails (e.g., if table doesn't exist yet)
    }

    // 2. Construct System Prompt
    const systemPrompt = `You are the central AI Agent for \"The Builder's Lab\".
You have access to the user's \"Knowledge Base\" which contains data from all their apps (Banana Blitz, Unravel, Serendipity, etc.).\n\nYour goal is to be a helpful, context-aware assistant.\nALWAYS reference the user's specific data if it appears in the \"RELEVANT USER DATA\" section.\nIf the user asks about something you found in the knowledge base, explicitely mention where it came from (e.g., \"I found that in your Unravel article...\").\n\n${context}\n\nConversation History:\n${history.slice(-5).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")} \nUser: ${message}\n`;

    // 3. Call Gemini
    const client = createGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash-exp", // Use the fast, smart model
      contents: [
        {
          parts: [{ text: systemPrompt }]
        }
      ]
    });

    // Extract text from the new SDK response structure
    // @ts-ignore - The SDK typing might be tricky, checking both property and candidates
    const responseText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;

    return { 
      success: true, 
      response: responseText || "I'm not sure how to respond to that." 
    };

  } catch (error: any) {
    console.error("Agent Chat Error:", error);
    return { success: false, error: error.message };
  }
}
