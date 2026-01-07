import { createGeminiClient } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { model, contents, config } = await req.json();

    if (!model || !contents) {
      return Response.json({ error: "Missing model or contents." }, { status: 400 });
    }

    const ai = createGeminiClient();
    const response = await ai.models.generateContent({ model, contents, config });

    return Response.json({
      text: response.text,
      candidates: response.candidates,
      usageMetadata: response.usageMetadata,
      modelVersion: response.modelVersion
    });
  } catch (error: any) {
    const message = error?.message || "Gemini request failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
