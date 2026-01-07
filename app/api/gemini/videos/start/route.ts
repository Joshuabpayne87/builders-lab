import { createGeminiClient } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { model, prompt, image, config } = await req.json();

    if (!model || !prompt) {
      return Response.json({ error: "Missing model or prompt." }, { status: 400 });
    }

    const ai = createGeminiClient();
    const operation = await ai.models.generateVideos({ model, prompt, image, config });

    return Response.json({ operation });
  } catch (error: any) {
    const message = error?.message || "Video generation start failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
