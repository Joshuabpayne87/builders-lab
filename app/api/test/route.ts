import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "API routes are working",
    env_check: {
      has_notion_key: !!process.env.PUBLIC_NOTION_API_KEY,
      has_database_id: !!process.env.PUBLIC_DATABASE_ID,
    }
  });
}
