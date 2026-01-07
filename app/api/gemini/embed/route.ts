import { createGeminiClient } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { model, contents } = await req.json();

    if (!model || !contents) {
      return Response.json({ error: "Missing model or contents." }, { status: 400 });
    }

    const ai = createGeminiClient();
    const response = await ai.models.embedContent({ model, contents });
    const data = response as any;

    return Response.json({
      embedding: data.embedding,
      embeddings: data.embeddings
    });
  } catch (error: any) {
    const message = error?.message || "Embedding request failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
