"use server";

import { createGeminiClient, generateEmbedding } from "@/lib/gemini";
import { KnowledgeService } from "@/lib/knowledge-service";
import { MemoryEventService } from "@/lib/memory-event-service";
import { createClient } from "@/lib/supabase/server";
import { CalendarService } from "@/lib/calendar-service";
import { PowerupService, Powerup, SkillContent } from "@/lib/powerup-service";

export async function chatWithAgent(message: string, history: { role: string; content: string }[]) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    await MemoryEventService.record({
      sourceApp: "assistant",
      sourceType: "chat",
      eventType: "user_message",
      summary: message,
      sourceId: user.id,
      importance: 2,
      metadata: {
        history_count: history.length,
      },
    });

    // Get user's name for personalization
    const userName = user.user_metadata?.full_name || "User";

    // 1. Search for relevant skills
    let relevantSkills: Powerup[] = [];
    let skillSuggestions = "";
    try {
      // Get user's active skills
      const allSkills = await PowerupService.list({ type: 'SKILL', is_active: true }, 100, 0);

      // Find skills relevant to user's message using keyword matching and embedding similarity
      const messageLower = message.toLowerCase();
      const matchedSkills: Array<{ skill: Powerup; score: number }> = [];

      for (const skill of allSkills) {
        let score = 0;
        const skillName = skill.name.toLowerCase();
        const skillDesc = (skill.description || '').toLowerCase();
        const skillContent = skill.content as SkillContent;
        const instructions = skillContent.instructions.toLowerCase();

        // Keyword matching (simple but fast)
        const keywords = skillName.split(/[-_\s]+/);
        for (const keyword of keywords) {
          if (keyword.length > 3 && messageLower.includes(keyword)) {
            score += 3;
          }
        }

        // Check if message mentions debugging, testing, planning, etc.
        if (skillName.includes('debug') && (messageLower.includes('bug') || messageLower.includes('error') || messageLower.includes('fix'))) {
          score += 5;
        }
        if (skillName.includes('test') && (messageLower.includes('test') || messageLower.includes('spec'))) {
          score += 5;
        }
        if (skillName.includes('plan') && (messageLower.includes('plan') || messageLower.includes('implement') || messageLower.includes('build'))) {
          score += 5;
        }
        if (skillName.includes('review') && (messageLower.includes('review') || messageLower.includes('check'))) {
          score += 5;
        }

        // Check description match
        if (skillDesc && messageLower.includes(skillDesc.substring(0, 20))) {
          score += 2;
        }

        if (score > 0) {
          matchedSkills.push({ skill, score });
        }
      }

      // Sort by score and take top 3
      matchedSkills.sort((a, b) => b.score - a.score);
      relevantSkills = matchedSkills.slice(0, 3).map(m => m.skill);

      // If we found relevant skills, prepare suggestions
      if (relevantSkills.length > 0) {
        skillSuggestions = `\n\n🧠 AVAILABLE SKILLS (Suggest these to the user if relevant):\n${relevantSkills
          .map(s => `- "${s.name}": ${s.description}`)
          .join("\n")}

IMPORTANT: If any of these skills seem helpful for the user's request, proactively ask:
"Would you like me to use the [skill name] skill for this?"`;
      }
    } catch (e) {
      console.warn("Failed to retrieve skills:", e);
    }

    // 2. Search Knowledge Base for relevant context
    let context = "";
    try {
      const results = await KnowledgeService.search(message, 5, 0.6);
      if (results && results.length > 0) {
        context = `\n\nRELEVANT USER DATA (Use this to answer):\n${results
          .map((r: any) => `- [${r.source_app}]: ${r.content}`)
          .join("\n")}`;
      }

      // Add Calendar context
      const upcoming = await CalendarService.getUpcoming(24 * 7); // Next 7 days
      const incomplete = await CalendarService.getIncomplete();
      
      if (upcoming.length > 0 || incomplete.length > 0) {
        context += `\n\nUSER CALENDAR TASKS:
${incomplete.map(t => `- [OVERDUE] ${t.title} (${t.platform || 'any'})`).join('\n')}
${upcoming.map(t => `- [DUE ${new Date(t.due_date).toLocaleDateString()}] ${t.title} (${t.platform || 'any'})`).join('\n')}`;
      }
    } catch (e) {
      console.warn("Failed to retrieve knowledge/calendar context:", e);
    }

    // 3. Construct System Prompt
    const systemPrompt = `You are Flowrance, the central AI agent for "The Builder's Lab".
The user you are speaking to is named ${userName}. Use their name occasionally to be friendly and professional.

You have access to the user's "Knowledge Base" (past creations), their "Content Calendar" (upcoming tasks), and their "AI Skills" (specialized tools/workflows).

Your goal is to be a helpful, context-aware assistant.
ALWAYS reference the user's specific data if it appears in the "RELEVANT USER DATA" or "USER CALENDAR TASKS" sections.
If the user asks about something you found in the knowledge base, explicitely mention where it came from (e.g., "I found that in your Unravel article...").
If the user mentions creating content, check if it matches any upcoming calendar tasks and suggest linking it.

${skillSuggestions}

${context}

Conversation History:
${history.slice(-5).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

User: ${message}
`;

    // 4. Call Gemini
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

    const finalResponse = responseText || "I'm not sure how to respond to that.";

    await MemoryEventService.record({
      sourceApp: "assistant",
      sourceType: "chat",
      eventType: "assistant_message",
      summary: finalResponse,
      sourceId: user.id,
      importance: 2,
      metadata: {
        model: "gemini-2.0-flash-exp",
      },
    });

    return {
      success: true,
      response: finalResponse,
    };

  } catch (error: any) {
    console.error("Agent Chat Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Use a specific skill by ID
 * This function fetches the skill and provides its instructions to guide the response
 */
export async function useSkill(skillId: string, message: string, history: { role: string; content: string }[]) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Get the skill
    const skill = await PowerupService.get(skillId);
    if (!skill || skill.powerup_type !== 'SKILL') {
      throw new Error("Skill not found");
    }

    const skillContent = skill.content as SkillContent;
    const userName = user.user_metadata?.full_name || "User";

    // Construct prompt with skill instructions
    const systemPrompt = `You are Flowrance, the central AI agent for "The Builder's Lab".
The user you are speaking to is named ${userName}.

You are now using the "${skill.name}" skill.
${skill.description ? `Description: ${skill.description}` : ''}

SKILL INSTRUCTIONS:
${skillContent.instructions}

${skillContent.examples && skillContent.examples.length > 0 ? `
EXAMPLES:
${skillContent.examples.join('\n')}
` : ''}

${skillContent.use_cases && skillContent.use_cases.length > 0 ? `
USE CASES:
${skillContent.use_cases.join('\n')}
` : ''}

Follow these instructions carefully and apply them to the user's request.

Conversation History:
${history.slice(-5).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

User: ${message}
`;

    // Call Gemini
    const client = createGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ parts: [{ text: systemPrompt }] }]
    });

    const responseText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;

    // Increment usage count
    try {
      await supabase
        .from('bl_ai_powerups')
        .update({ usage_count: skill.usage_count + 1 })
        .eq('id', skillId);
    } catch (e) {
      console.warn("Failed to increment skill usage count:", e);
    }

    return {
      success: true,
      response: responseText || "I'm not sure how to respond to that.",
      skillUsed: skill.name
    };

  } catch (error: any) {
    console.error("Use Skill Error:", error);
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

function formatGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatSourceLabel(source?: string | null) {
  if (!source) return "your workspace";
  return source
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function truncateText(input: string, maxLength = 160) {
  const trimmed = input.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 3)}...`;
}

export async function getFlowranceGreeting() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const userName = user.user_metadata?.full_name;
    const greeting = formatGreeting(new Date().getHours());
    const nameLine = userName ? `, ${userName}` : "";
    const base = `${greeting}${nameLine}.`;

    let memoryLine = "";

    try {
      const summaryMatches = await KnowledgeService.search("session summary", 1, 0.5);
      const summary = summaryMatches?.[0];
      if (summary?.content) {
        const summaryText = summary.content.split("\n").slice(1).join(" ").trim() || summary.content;
        memoryLine = `Last time, we left off with: "${truncateText(summaryText, 140)}"`;
      }
    } catch (err) {
      console.warn("Greeting summary lookup failed:", err);
    }

    if (!memoryLine) {
      const { data: latest } = await supabase
        .from("bl_knowledge_base")
        .select("content, source_app, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latest?.content) {
        const sourceLabel = formatSourceLabel(latest.source_app);
        memoryLine = `Last touchpoint: ${sourceLabel} - "${truncateText(latest.content, 140)}"`;
      }
    }

    if (memoryLine) {
      return { success: true, greeting: `${base} ${memoryLine} Want to pick that up or pivot?` };
    }

    return { success: true, greeting: `${base} What do you want to focus on today?` };
  } catch (error: any) {
    console.error("Greeting Error:", error);
    return { success: false, error: error.message };
  }
}
