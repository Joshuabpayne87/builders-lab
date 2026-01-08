import { createGeminiClient } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { model, contents, config } = await req.json();

    if (!model || !contents) {
      return Response.json({ error: "Missing model or contents." }, { status: 400 });
    }

    const ai = createGeminiClient();
    const response = await ai.models.generateContent({ model, contents, config });

    // Safely get text if available
    let text = "";
    try {
      text = response.text || "";
    } catch (e) {
      // response.text might throw if there's no text part (e.g. audio only)
    }

    return Response.json({
      text,
      candidates: response.candidates,
      usageMetadata: response.usageMetadata,
      modelVersion: response.modelVersion
    });
  } catch (error: any) {
    const message = error?.message || "Gemini request failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
