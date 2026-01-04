import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const PUBLIC_NOTION_API_KEY = process.env.PUBLIC_NOTION_API_KEY || process.env.NOTION_API_KEY || "";

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

    const notion = new Client({ auth: PUBLIC_NOTION_API_KEY });

    const blocks = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });

    return NextResponse.json(blocks.results);
  } catch (error: any) {
    console.error("Error fetching page blocks:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
