import { createNotionClient } from "@/lib/notion";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json({ error: "pageId is required" }, { status: 400 });
    }

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
      // Continue with original ID if page retrieval fails
    }

    // Fetch blocks using the confirmed page ID
    const blocks = await notion.blocks.children.list({
      block_id: actualPageId,
      page_size: 100,
    });

    console.log("[DEBUG] blocks.results type:", Array.isArray(blocks?.results) ? "array" : typeof blocks?.results);
    console.log("[DEBUG] blocks.results length:", blocks?.results?.length);

    if (!blocks.results || !Array.isArray(blocks.results)) {
      throw new Error("Invalid response from Notion API");
    }

    return NextResponse.json(blocks.results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
