import { createGeminiClient } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { model, contents, config } = await req.json();

    if (!model || !contents) {
      return Response.json({ error: "Missing model or contents." }, { status: 400 });
    }

    const ai = createGeminiClient();
    const response = await ai.models.generateContent({ model, contents, config });

    // Explicitly serialize candidates to ensure parts are included
    const candidates = response.candidates?.map(c => ({
      content: {
        parts: c.content?.parts?.map(p => {
          const part: any = {};
          if (p.text) part.text = p.text;
          if (p.inlineData) part.inlineData = p.inlineData;
          if (p.fileData) part.fileData = p.fileData;
          if (p.functionCall) part.functionCall = p.functionCall;
          if (p.functionResponse) part.functionCall = p.functionResponse;
          return part;
        }),
        role: c.content?.role
      },
      finishReason: c.finishReason,
      index: c.index,
      safetyRatings: c.safetyRatings,
      groundingMetadata: c.groundingMetadata
    }));

    // Safely get text
    let text = "";
    try {
      text = response.text || "";
    } catch (e) {}

    return Response.json({
      text,
      candidates,
      usageMetadata: response.usageMetadata,
      modelVersion: response.modelVersion
    });
  } catch (error: any) {
    const message = error?.message || "Gemini request failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
