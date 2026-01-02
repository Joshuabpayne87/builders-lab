import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const PUBLIC_NOTION_API_KEY = process.env.PUBLIC_NOTION_API_KEY || "";
const PUBLIC_DATABASE_ID = process.env.PUBLIC_DATABASE_ID || "";

export async function GET() {
  try {
    const notion = new Client({ auth: PUBLIC_NOTION_API_KEY });

    // Query the database directly
    let allResults: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: PUBLIC_DATABASE_ID,
        sorts: [
          {
            timestamp: "last_edited_time",
            direction: "descending",
          },
        ],
        page_size: 100,
        start_cursor: startCursor,
      });

      allResults = allResults.concat(response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor ?? undefined;
    }

    // Process results
    const resources = allResults.map((page: any, index: number) => {
      const properties = page.properties || {};

      // Try multiple approaches to get title
      let title = "Untitled";

      // Approach 1: Check if there's a direct title property
      if (page.title && Array.isArray(page.title) && page.title.length > 0) {
        title = page.title.map((t: any) => t.plain_text || t.text?.content || "").join("");
      }

      // Approach 2: Check properties for title-like fields
      if (title === "Untitled") {
        const titleProps = ["Resource Title", "Name", "Title", "name", "title", "页面"];
        for (const prop of titleProps) {
          if (properties[prop]) {
            const propData = properties[prop];
            if (propData.title && Array.isArray(propData.title) && propData.title.length > 0) {
              title = propData.title.map((t: any) => t.plain_text || t.text?.content || "").join("");
              break;
            }
          }
        }
      }

      // Approach 3: Try to get from any property that has type "title"
      if (title === "Untitled") {
        for (const [key, value] of Object.entries(properties)) {
          const prop = value as any;
          if (prop?.type === "title" && prop.title && Array.isArray(prop.title) && prop.title.length > 0) {
            title = prop.title.map((t: any) => t.plain_text || t.text?.content || "").join("");
            break;
          }
        }
      }

      const tags =
        properties.Tags?.multi_select?.map((tag: any) => tag.name) || [];

      // Extract cover image
      let coverImage = null;
      if (page.cover) {
        if (page.cover.type === "external") {
          coverImage = page.cover.external?.url;
        } else if (page.cover.type === "file") {
          coverImage = page.cover.file?.url;
        }
      }

      return {
        id: page.id,
        title,
        tags,
        url: page.url,
        lastEdited: page.last_edited_time,
        coverImage,
      };
    });

    return NextResponse.json(resources);
  } catch (error: any) {
    console.error("Error fetching public resources:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
