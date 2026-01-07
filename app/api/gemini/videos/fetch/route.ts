export async function POST(req: Request) {
  try {
    const { uri } = await req.json();

    if (!uri) {
      return Response.json({ error: "Missing video uri." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY not configured." }, { status: 500 });
    }

    const hasKey = uri.includes("key=");
    const url = hasKey ? uri : `${uri}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      return Response.json({ error: "Failed to fetch video." }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    const buffer = await response.arrayBuffer();

    return new Response(buffer, { headers: { "Content-Type": contentType } });
  } catch (error: any) {
    const message = error?.message || "Video fetch failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
