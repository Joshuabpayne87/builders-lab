export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY;
  return Response.json({ hasKey });
}
