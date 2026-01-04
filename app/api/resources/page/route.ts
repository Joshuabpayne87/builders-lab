import { NextRequest, NextResponse } from "next/server";
import { createNotionClient } from "@/lib/notion";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json(
        { error: "pageId is required" },
        { status: 400 }
      );
    }

    // Ensure environment variables are available for the client
    if (!process.env.NOTION_API_KEY && process.env.PUBLIC_NOTION_API_KEY) {
      process.env.NOTION_API_KEY = process.env.PUBLIC_NOTION_API_KEY;
    }

    const notion = createNotionClient();

    // Use type casting to bypass potential SDK discrepancies in v5.6.0
    const blocks = await (notion as any).blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });

    console.log("[DEBUG] Fetching blocks for pageId:", pageId);
    console.log("[DEBUG] Blocks response:", JSON.stringify(blocks, null, 2));
    console.log("[DEBUG] blocks.results type:", Array.isArray(blocks?.results) ? "array" : typeof blocks?.results);
    console.log("[DEBUG] blocks.results length:", blocks?.results?.length);

    return NextResponse.json(blocks.results);
  } catch (error: any) {
    console.error("Error fetching page blocks:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
