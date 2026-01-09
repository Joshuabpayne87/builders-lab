import { createGeminiClient } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { model, contents, config } = await req.json();

    if (!model || !contents) {
      return Response.json({ error: "Missing model or contents." }, { status: 400 });
    }

    const ai = createGeminiClient();

    // Handle Imagen 3 models differently
    const isImagenModel = model.includes('imagen');

    // Normalize contents format to ensure proper structure
    let normalizedContents;
    if (isImagenModel) {
      // Imagen expects a simple prompt format
      normalizedContents = typeof contents === 'string'
        ? [{ parts: [{ text: contents }] }]
        : Array.isArray(contents) && typeof contents[0] === 'object' && contents[0].text
        ? [{ parts: [{ text: contents[0].text }] }]
        : contents;
    } else {
      // Regular Gemini models
      normalizedContents = Array.isArray(contents)
        ? contents.map(c => {
            if (typeof c === 'object' && c.parts) {
              return { parts: c.parts };
            }
            return c;
          })
        : contents;
    }

    const response = await ai.models.generateContent({
      model,
      contents: normalizedContents,
      config
    });

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
    console.error("Gemini API Error:", {
      message: error?.message,
      status: error?.status,
      model: error?.model,
      details: error?.details || error
    });

    const message = error?.message || "Gemini request failed.";
    const errorDetails = error?.details?.[0]?.reason || error?.status || "";

    return Response.json({
      error: `${message}${errorDetails ? ` (${errorDetails})` : ""}`,
      model: error?.model
    }, { status: error?.status || 500 });
  }
}
