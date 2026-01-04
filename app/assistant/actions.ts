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

export async function generateSessionSummary() {
  try {
    // 1. Get today's data
    const activities = await KnowledgeService.getTodaysKnowledge();
    
    if (!activities || activities.length === 0) {
      return { success: false, error: "No activities found for today." };
    }

    // 2. Format activities for the prompt
    const activityLog = activities
      .map(a => `[${a.source_app} - ${a.source_type}]: ${a.content}`)
      .join("\n");

    const prompt = `You are a high-performance productivity coach.
Summarize the user's session in The Builder's Lab today based on these activities:

${activityLog}

Provide a concise, motivating summary. 
Include:
1. Key accomplishments.
2. Where they left off.
3. A suggested "next step" for their next session.

Format it as a professional summary.`;

    // 3. Generate Summary with Gemini
    const client = createGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ parts: [{ text: prompt }] }]
    });

    const summary = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) throw new Error("Failed to generate summary");

    // 4. Save the summary back to knowledge base so the agent remembers the "last session"
    await KnowledgeService.save({
      content: `SESSION SUMMARY (${new Date().toLocaleDateString()}):\n\n${summary}`,
      sourceApp: 'assistant',
      sourceType: 'session_summary',
      metadata: { date: new Date().toISOString() }
    });

    return { success: true, summary };

  } catch (error: any) {
    console.error("Session Summary Error:", error);
    return { success: false, error: error.message };
  }
}
