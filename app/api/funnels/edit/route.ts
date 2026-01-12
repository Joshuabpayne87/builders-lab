import { createGeminiClient } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { htmlCode, instruction } = await req.json();

    if (!htmlCode || !instruction) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = createGeminiClient();

    const prompt = `You are an expert web developer. Modify the following HTML code based on the user's instruction.

INSTRUCTION: ${instruction}

CURRENT HTML:
${htmlCode}

REQUIREMENTS:
1. Make ONLY the changes requested in the instruction
2. Preserve all existing functionality
3. Maintain the form submission logic
4. Keep the same structure unless specifically asked to change it
5. Return ONLY the complete modified HTML code
6. Do NOT include markdown code blocks or explanations
7. Ensure the code is production-ready

Return the complete modified HTML:`;

    const result = await client.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    let modifiedHtml = result.text || "";
    modifiedHtml = modifiedHtml.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();

    return NextResponse.json({
      htmlCode: modifiedHtml,
      success: true,
    });
  } catch (error) {
    console.error("Edit error:", error);
    return NextResponse.json(
      { error: "Failed to edit code", success: false },
      { status: 500 }
    );
  }
}
