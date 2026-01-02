// CRM Enrichment Service - AI-powered contact scoring and enrichment
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import type {
  Contact,
  ContactScore,
  ScoreFactors,
  Activity,
  Deal,
  AINextAction,
} from "../types";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ============================================================================
// CONTACT SCORING
// ============================================================================

/**
 * Calculate contact score based on multiple factors
 */
export async function calculateContactScore(
  contact: Contact,
  activities: Activity[],
  deals: Deal[]
): Promise<ContactScore> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Calculate individual score factors
  const scoreFactors: ScoreFactors = {
    recency: calculateRecencyScore(contact, activities),
    frequency: calculateFrequencyScore(activities),
    deal_value: calculateDealValueScore(deals),
    engagement: calculateEngagementScore(activities),
  };

  // Calculate total lead score (weighted average)
  const lead_score = Math.round(
    scoreFactors.recency * 0.3 +
      scoreFactors.frequency * 0.2 +
      scoreFactors.deal_value * 0.3 +
      scoreFactors.engagement * 0.2
  );

  // Calculate engagement score
  const engagement_score = Math.round(
    (scoreFactors.recency + scoreFactors.frequency + scoreFactors.engagement) / 3
  );

  // Generate AI reasoning and recommendations
  const { reasoning, recommended_actions } = await generateScoringInsights(
    contact,
    activities,
    deals,
    scoreFactors,
    lead_score
  );

  // Save to database
  const { data, error } = await supabase
    .from("bl_crm_contact_scores")
    .upsert(
      {
        user_id: user.id,
        contact_id: contact.id,
        lead_score,
        engagement_score,
        score_factors: scoreFactors,
        ai_reasoning: reasoning,
        recommended_actions,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "contact_id" }
    )
    .select()
    .single();

  if (error) throw new Error(`Failed to save contact score: ${error.message}`);
  return data as ContactScore;
}

/**
 * Calculate recency score (0-100) - How recently was the contact engaged?
 */
function calculateRecencyScore(contact: Contact, activities: Activity[]): number {
  const lastContact = contact.last_contacted_at || contact.created_at;
  const daysSinceContact = Math.floor(
    (Date.now() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Score decreases as days increase
  if (daysSinceContact === 0) return 100;
  if (daysSinceContact <= 7) return 90;
  if (daysSinceContact <= 14) return 75;
  if (daysSinceContact <= 30) return 60;
  if (daysSinceContact <= 60) return 40;
  if (daysSinceContact <= 90) return 20;
  return 10;
}

/**
 * Calculate frequency score (0-100) - How often do you engage?
 */
function calculateFrequencyScore(activities: Activity[]): number {
  const last30Days = activities.filter((a) => {
    const age = Date.now() - new Date(a.created_at).getTime();
    return age < 30 * 24 * 60 * 60 * 1000; // 30 days in ms
  });

  const count = last30Days.length;
  if (count === 0) return 0;
  if (count >= 10) return 100;
  return Math.min(count * 10, 100);
}

/**
 * Calculate deal value score (0-100) - Based on associated deal values
 */
function calculateDealValueScore(deals: Deal[]): number {
  const totalValue = deals
    .filter((d) => d.status === "OPEN" || d.status === "WON")
    .reduce((sum, d) => sum + (d.value || 0), 0);

  if (totalValue === 0) return 0;
  if (totalValue >= 100000) return 100;
  if (totalValue >= 50000) return 85;
  if (totalValue >= 25000) return 70;
  if (totalValue >= 10000) return 55;
  if (totalValue >= 5000) return 40;
  return Math.min((totalValue / 5000) * 40, 40);
}

/**
 * Calculate engagement score (0-100) - Two-way communication quality
 */
function calculateEngagementScore(activities: Activity[]): number {
  const emailsAndCalls = activities.filter(
    (a) => a.activity_type === "EMAIL" || a.activity_type === "CALL"
  );

  const meetings = activities.filter((a) => a.activity_type === "MEETING");

  const engagement = emailsAndCalls.length * 5 + meetings.length * 15;
  return Math.min(engagement, 100);
}

/**
 * Generate AI insights about the contact score
 */
async function generateScoringInsights(
  contact: Contact,
  activities: Activity[],
  deals: Deal[],
  scoreFactors: ScoreFactors,
  lead_score: number
): Promise<{ reasoning: string; recommended_actions: AINextAction[] }> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `Analyze this contact's engagement and provide insights:

Contact: ${contact.name}
Contact Type: ${contact.contact_type}
Company: ${contact.company || "N/A"}

Score Breakdown:
- Recency Score: ${scoreFactors.recency}/100
- Frequency Score: ${scoreFactors.frequency}/100
- Deal Value Score: ${scoreFactors.deal_value}/100
- Engagement Score: ${scoreFactors.engagement}/100
- Overall Lead Score: ${lead_score}/100

Activity Count: ${activities.length}
Deal Count: ${deals.length}
Total Deal Value: $${deals.reduce((sum, d) => sum + (d.value || 0), 0)}

Provide:
1. A brief reasoning (2-3 sentences) explaining the score
2. Top 3 recommended actions to improve engagement or move forward

Return as JSON:
{
  "reasoning": "explanation of the score",
  "recommended_actions": [
    {"action": "specific action", "priority": "high/medium/low", "reasoning": "why this matters"}
  ]
}`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text();
    const parsed = JSON.parse(text);

    return {
      reasoning: parsed.reasoning,
      recommended_actions: parsed.recommended_actions || [],
    };
  } catch (error) {
    console.error("AI scoring insights failed:", error);
    return {
      reasoning: `Contact has a lead score of ${lead_score}/100 based on recent activity and engagement levels.`,
      recommended_actions: [
        {
          action: "Schedule follow-up",
          priority: lead_score > 70 ? "high" : "medium",
          reasoning: "Maintain engagement momentum",
        },
      ],
    };
  }
}

// ============================================================================
// DUPLICATE DETECTION
// ============================================================================

/**
 * Find potential duplicate contacts
 */
export async function findDuplicateContacts(
  contact: Contact
): Promise<{ duplicates: Contact[]; similarity: number[] }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get all other contacts
  const { data: allContacts } = await supabase
    .from("bl_crm_contacts")
    .select("*")
    .eq("user_id", user.id)
    .neq("id", contact.id);

  if (!allContacts) return { duplicates: [], similarity: [] };

  const duplicates: Contact[] = [];
  const similarities: number[] = [];

  allContacts.forEach((other) => {
    const score = calculateSimilarity(contact, other);
    if (score > 0.6) {
      // 60% similarity threshold
      duplicates.push(other as Contact);
      similarities.push(score);
    }
  });

  // Sort by similarity (highest first)
  const sorted = duplicates
    .map((dup, i) => ({ contact: dup, similarity: similarities[i] }))
    .sort((a, b) => b.similarity - a.similarity);

  return {
    duplicates: sorted.map((s) => s.contact),
    similarity: sorted.map((s) => s.similarity),
  };
}

/**
 * Calculate similarity between two contacts (0-1)
 */
function calculateSimilarity(contact1: Contact, contact2: Contact): number {
  let score = 0;
  let checks = 0;

  // Name similarity
  if (contact1.name && contact2.name) {
    checks++;
    const nameSim = stringSimilarity(
      contact1.name.toLowerCase(),
      contact2.name.toLowerCase()
    );
    score += nameSim;
  }

  // Email similarity
  if (contact1.email && contact2.email) {
    checks++;
    score += contact1.email.toLowerCase() === contact2.email.toLowerCase() ? 1 : 0;
  }

  // Company similarity
  if (contact1.company && contact2.company) {
    checks++;
    const companySim = stringSimilarity(
      contact1.company.toLowerCase(),
      contact2.company.toLowerCase()
    );
    score += companySim;
  }

  // Phone similarity
  if (contact1.phone && contact2.phone) {
    checks++;
    const phone1 = contact1.phone.replace(/\D/g, ""); // Remove non-digits
    const phone2 = contact2.phone.replace(/\D/g, "");
    score += phone1 === phone2 ? 1 : 0;
  }

  return checks > 0 ? score / checks : 0;
}

/**
 * Calculate string similarity (Levenshtein distance normalized)
 */
function stringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;

  const matrix: number[][] = [];

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[len2][len1];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}

// ============================================================================
// GET CONTACT SCORE
// ============================================================================

/**
 * Get existing contact score
 */
export async function getContactScore(contactId: string): Promise<ContactScore | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_crm_contact_scores")
    .select("*")
    .eq("contact_id", contactId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No score found
    throw new Error(`Failed to fetch contact score: ${error.message}`);
  }

  return data as ContactScore;
}
