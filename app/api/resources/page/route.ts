import { NextRequest, NextResponse } from "next/server";
import { createNotionClient } from "@/lib/notion";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPageId = searchParams.get("pageId");

    if (!rawPageId) {
      return NextResponse.json(
        { error: "pageId is required" },
        { status: 400 }
      );
    }

    const pageId = rawPageId.trim();

    // Ensure environment variables are available for the client
    if (!process.env.NOTION_API_KEY && process.env.PUBLIC_NOTION_API_KEY) {
      process.env.NOTION_API_KEY = process.env.PUBLIC_NOTION_API_KEY;
    }

    const notion = createNotionClient();

    console.log("[DEBUG] Fetching blocks for pageId:", pageId);

    // First, try to retrieve the page to ensure it exists and we have access
    let actualPageId = pageId;
    try {
      const page = await notion.pages.retrieve({ page_id: pageId });
      console.log("[DEBUG] Page retrieved successfully:", page.id);
      actualPageId = page.id;
    } catch (pageError: any) {
      console.error("[DEBUG] Error retrieving page:", pageError.message);
      // If page retrieval fails, likely permissions or ID issue.
      // We can return 404 here, or continue to try blocks (unlikely to work).
      // Let's return a clean error or empty blocks to trigger fallback.
      if (pageError.status === 404) {
         return NextResponse.json([]); 
      }
    }

    // Fetch blocks using the confirmed page ID
    let blocks;
    try {
      blocks = await notion.blocks.children.list({
        block_id: actualPageId,
        page_size: 100,
      });
    } catch (blockError: any) {
      console.error("[DEBUG] Error fetching blocks:", blockError.message);
      // If we can't get blocks, return empty array so UI shows cover/link fallback
      return NextResponse.json([]);
    }

    console.log("[DEBUG] blocks.results type:", Array.isArray(blocks?.results) ? "array" : typeof blocks?.results);
    console.log("[DEBUG] blocks.results length:", blocks?.results?.length);

    if (!blocks.results || !Array.isArray(blocks.results)) {
      throw new Error("Invalid response from Notion API");
    }

    return NextResponse.json(blocks.results);
  } catch (error: any) {
    console.error("Error fetching page blocks:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
