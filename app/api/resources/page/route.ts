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

    // Prefer public Notion key for public resources (avoids mismatch with private key).
    if (process.env.PUBLIC_NOTION_API_KEY) {
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

    const MAX_DEPTH = 5;
    async function fetchBlockChildren(blockId: string, depth: number): Promise<any[]> {
      if (depth >= MAX_DEPTH) {
        return [];
      }

      const allChildren: any[] = [];
      let cursor: string | undefined = undefined;

      do {
        const response = await notion.blocks.children.list({
          block_id: blockId,
          page_size: 100,
          start_cursor: cursor,
        });

        if (Array.isArray(response.results)) {
          allChildren.push(...response.results);
        }

        cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
      } while (cursor);

      for (const child of allChildren) {
        if ("has_children" in child && child.has_children && "id" in child) {
          (child as any).children = await fetchBlockChildren(child.id, depth + 1);
        }
      }

      return allChildren;
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

    const enrichedBlocks = [];
    for (const block of blocks.results) {
      if ("has_children" in block && block.has_children && "id" in block) {
        const children = await fetchBlockChildren(block.id, 0);
        enrichedBlocks.push({ ...block, children });
      } else {
        enrichedBlocks.push(block);
      }
    }

    return NextResponse.json(enrichedBlocks);
  } catch (error: any) {
    console.error("Error fetching page blocks:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
