import { createGeminiClient } from "@/lib/gemini";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const REFINEMENT_PROMPT = `
You are a landing page refinement expert. A user has a deployed landing page and wants to make a specific edit.

Your task:
1. You will receive the current HTML code and the user's requested change
2. Make ONLY the requested change - don't modify anything else
3. Return ONLY the modified HTML code (no explanations, no markdown)
4. Preserve all functionality and styling except what needs to change

Important rules:
- Do NOT regenerate the entire page
- Do NOT change the form submission logic
- Do NOT remove any sections unless explicitly asked
- Keep all scripts, styles, and functionality intact
- Focus on surgical, minimal changes
- If the change is unclear, make a reasonable interpretation

Return the complete modified HTML that can be deployed immediately.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { funnelId, htmlCode, refinementRequest } = body;

    if (!funnelId || !htmlCode || !refinementRequest) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user owns this funnel
    const { data: funnel } = await supabase
      .from("bl_funnels_projects")
      .select("id")
      .eq("id", funnelId)
      .eq("user_id", user.id)
      .single();

    if (!funnel) {
      return NextResponse.json(
        { error: "Funnel not found or unauthorized" },
        { status: 404 }
      );
    }

    // Call Gemini to refine the code
    const client = createGeminiClient();

    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: REFINEMENT_PROMPT,
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Current HTML Code:\n\n${htmlCode}\n\nRequested Change:\n${refinementRequest}\n\nProvide the complete modified HTML now.`,
            },
          ],
        },
      ],
    });

    let refinedCode = result.text || "";

    // Remove markdown code blocks if present
    refinedCode = refinedCode.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();

    return NextResponse.json({
      success: true,
      htmlCode: refinedCode,
    });
  } catch (error) {
    console.error("Refinement error:", error);
    return NextResponse.json(
      { error: "Failed to refine code", success: false },
      { status: 500 }
    );
  }
}
