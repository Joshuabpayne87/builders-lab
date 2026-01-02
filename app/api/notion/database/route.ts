import { getNotionDatabase } from "@/lib/notion";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const entries = await getNotionDatabase();
    return NextResponse.json(entries);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
