// CRM AI Automation Service using Gemini
import { createGeminiClient } from "@/lib/gemini";
import type {
  Contact,
  Activity,
  Deal,
  AIContactSummary,
  AINextAction,
  AIEmailDraft,
  AIDealAnalysis,
} from "../types";

const callGeminiJson = async (prompt: string, temperature: number) => {
  const ai = createGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      temperature,
      responseMimeType: "application/json"
    }
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from AI");

  // Robust JSON parsing: remove markdown blocks if present
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
  const cleanJson = jsonMatch ? jsonMatch[1] : text;

  try {
    return JSON.parse(cleanJson.trim());
  } catch (e) {
    console.error("JSON parse error. Raw text:", text);
    throw new Error("Invalid JSON response from AI");
  }
};

/**
 * Generate AI-powered contact summary
 */
export async function generateContactSummary(
  contact: Contact,
  activities: Activity[],
  deals: Deal[]
): Promise<AIContactSummary> {
  const prompt = `Analyze this contact and provide a concise 2-3 sentence summary:

Contact: ${contact.name}
${contact.company ? `Company: ${contact.company}` : ""}
${contact.title ? `Title: ${contact.title}` : ""}
Contact Type: ${contact.contact_type}
${contact.notes ? `Notes: ${contact.notes}` : ""}

Recent Activities (${activities.length}):
${activities.slice(0, 5).map((a) => `- ${a.activity_type}: ${a.title} (${new Date(a.created_at).toLocaleDateString()})`).join("\n")}

Active Deals (${deals.length}):
${deals.slice(0, 3).map((d) => `- ${d.title}: $${d.value || 0} (${d.stage})`).join("\n")}

Provide:
1. A 2-3 sentence summary of this contact's profile and relationship
2. 3 key insights about this contact

Return as JSON:
{
  "summary": "2-3 sentence summary",
  "keyInsights": ["insight 1", "insight 2", "insight 3"]
}`;

  try {
    const data = await callGeminiJson(prompt, 0.3);
    return {
      summary: data.summary || "No summary available",
      keyInsights: data.keyInsights || [],
      lastInteraction: activities.length > 0 ? activities[0].created_at : undefined,
    };
  } catch (error) {
    console.error("Error generating contact summary:", error);
    throw new Error("Failed to generate contact summary");
  }
}

/**
 * Suggest next actions for a contact
 */
export async function suggestNextActions(
  contact: Contact,
  activities: Activity[],
  deals: Deal[]
): Promise<AINextAction[]> {
  const lastActivity = activities[0];
  const lastContactDate = contact.last_contacted_at
    ? new Date(contact.last_contacted_at).toLocaleDateString()
    : "Never";

  const prompt = `Based on this contact's information, suggest 3 specific next actions:

Contact: ${contact.name} (${contact.contact_type})
${contact.company ? `Company: ${contact.company}` : ""}
Last contacted: ${lastContactDate}
${lastActivity ? `Last activity: ${lastActivity.activity_type} - ${lastActivity.title}` : "No activities yet"}

Active deals: ${deals.filter((d) => d.status === "OPEN").length}
${deals.filter((d) => d.status === "OPEN").slice(0, 2).map((d) => `- ${d.title} (${d.stage})`).join("\n")}

Suggest 3 specific, actionable next steps with priority (high/medium/low) and reasoning.

Return as JSON:
{
  "actions": [
    {
      "action": "specific action to take",
      "priority": "high|medium|low",
      "reasoning": "why this action is important"
    }
  ]
}`;

  try {
    const data = await callGeminiJson(prompt, 0.5);
    return data.actions || [];
  } catch (error) {
    console.error("Error suggesting next actions:", error);
    throw new Error("Failed to suggest next actions");
  }
}

/**
 * Draft a contextual email
 */
export async function draftEmail(
  contact: Contact,
  purpose: string,
  context?: string
): Promise<AIEmailDraft> {
  const prompt = `Draft a professional email to this contact:

To: ${contact.name}
${contact.company ? `Company: ${contact.company}` : ""}
${contact.title ? `Title: ${contact.title}` : ""}
Contact Type: ${contact.contact_type}

Purpose: ${purpose}
${context ? `Additional Context: ${context}` : ""}

Generate a professional, warm, and personalized email with:
- Appropriate subject line
- Professional greeting
- Clear body text (2-3 paragraphs)
- Appropriate sign-off

Tone: ${contact.contact_type === "PARTNER" ? "collaborative and friendly" : contact.contact_type === "LEAD" ? "helpful and informative" : "professional and warm"}

Return as JSON:
{
  "subject": "subject line",
  "body": "email body with paragraphs separated by \\n\\n",
  "tone": "description of tone used"
}`;

  try {
    const data = await callGeminiJson(prompt, 0.7);
    return {
      subject: data.subject || "Follow-up",
      body: data.body || "",
      tone: data.tone || "professional",
    };
  } catch (error) {
    console.error("Error drafting email:", error);
    throw new Error("Failed to draft email");
  }
}

/**
 * Analyze deal health and provide insights
 */
export async function analyzeDealHealth(
  deal: Deal,
  contact: Contact,
  activities: Activity[]
): Promise<AIDealAnalysis> {
  const dealAge = Math.floor(
    (Date.now() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const recentActivities = activities.filter(
    (a) => Date.now() - new Date(a.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
  );

  const prompt = `Analyze this deal and provide health assessment:

Deal: ${deal.title}
Value: $${deal.value || 0}
Stage: ${deal.stage}
Status: ${deal.status}
Age: ${dealAge} days
${deal.expected_close_date ? `Expected close: ${deal.expected_close_date}` : "No close date set"}

Contact: ${contact.name} (${contact.contact_type})
${contact.company ? `Company: ${contact.company}` : ""}

Recent activity (last 7 days): ${recentActivities.length} interactions
${recentActivities.slice(0, 3).map((a) => `- ${a.activity_type}: ${a.title}`).join("\n")}

Analyze:
1. Win probability (0-100)
2. Key insights about the deal
3. Recommendations for moving forward
4. Potential risk factors

Return as JSON:
{
  "probability": 75,
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["rec 1", "rec 2", "rec 3"],
  "riskFactors": ["risk 1", "risk 2"]
}`;

  try {
    const data = await callGeminiJson(prompt, 0.4);
    return {
      probability: Math.min(100, Math.max(0, data.probability || 50)),
      insights: data.insights || [],
      recommendations: data.recommendations || [],
      riskFactors: data.riskFactors || [],
    };
  } catch (error) {
    console.error("Error analyzing deal health:", error);
    throw new Error("Failed to analyze deal health");
  }
}
