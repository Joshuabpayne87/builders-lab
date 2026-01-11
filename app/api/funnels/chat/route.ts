import { createGeminiClient } from "@/lib/gemini";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are the "Sales Architect" for The Builder's Lab. Your goal is to guide the user through the BMaD (Blueprint, Model, and Development) process to build a high-converting sales funnel.

CURRENT PHASE: 1. IDEA GENERATION & STRATEGY

Your Process:
1. **Clarify the Offer:** Ask what they are selling.
2. **Define the Avatar:** Ask who the ideal customer is.
3. **Determine the Price:** Ask for the price point.
4. **Propose the Strategy:** Based on the above, recommend a specific funnel type (e.g., VSL Funnel, Webinar Funnel, Lead Magnet Funnel) and outline the steps.

RULES:
- Be professional, concise, and direct.
- Do NOT generate code yet. We are in the Strategy phase.
- Ask ONE question at a time to keep the user focused.
- Once you have enough info (Offer, Avatar, Price), output a "Strategy Summary" and ask for approval to generate the Blueprint.

Example Interaction:
User: "I want to sell a course on dog training."
You: "Great niche. Who is the specific target audience? (e.g., New puppy owners, professional trainers, owners of aggressive dogs)"
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const client = createGeminiClient();

    // Convert frontend messages to Gemini format
    const history = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const result = await client.models.generateContent({
      model: "gemini-2.0-flash-exp", // Using the fast model for chat
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
      contents: history,
    });

    const responseText = result.response.text();

    return NextResponse.json({ content: responseText });
  } catch (error) {
    console.error("Funnel Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
