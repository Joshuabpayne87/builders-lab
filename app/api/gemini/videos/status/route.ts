import { createGeminiClient } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { operation } = await req.json();

    if (!operation) {
      return Response.json({ error: "Missing operation." }, { status: 400 });
    }

    const ai = createGeminiClient();
    const status = await ai.operations.getVideosOperation({ operation });

    return Response.json({ operation: status });
  } catch (error: any) {
    const message = error?.message || "Video status check failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
