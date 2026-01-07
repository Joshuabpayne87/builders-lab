import { createGeminiClient } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { model, contents, config } = await req.json();

    if (!model || !contents) {
      return Response.json({ error: "Missing model or contents." }, { status: 400 });
    }

    const ai = createGeminiClient();
    const responseStream = await ai.models.generateContentStream({ model, contents, config });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk?.text;
            if (typeof text === "string" && text.length > 0) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (streamError: any) {
          const message = streamError?.message || "Stream error.";
          controller.enqueue(encoder.encode(`\n${message}`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache"
      }
    });
  } catch (error: any) {
    const message = error?.message || "Gemini stream failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
