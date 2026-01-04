import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const PUBLIC_NOTION_API_KEY = process.env.PUBLIC_NOTION_API_KEY || "";
const PUBLIC_DATABASE_ID = process.env.PUBLIC_DATABASE_ID || "";

export async function GET() {
  try {
    // Validate environment variables
    if (!PUBLIC_NOTION_API_KEY) {
      return NextResponse.json(
        { error: "PUBLIC_NOTION_API_KEY is not configured" },
        { status: 500 }
      );
    }

    if (!PUBLIC_DATABASE_ID) {
      return NextResponse.json(
        { error: "PUBLIC_DATABASE_ID is not configured" },
        { status: 500 }
      );
    }

    const notion = new Client({ auth: PUBLIC_NOTION_API_KEY });

    // Step 1: Query the database using standard API
    let allResults: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    while (hasMore) {
      const response: any = await (notion as any).databases.query({
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
    const resources = allResults.map((page: any) => {
      const properties = page.properties || {};

      // Safe property extraction
      let title = "Untitled";
      const titleProp = Object.values(properties).find((p: any) => p.type === 'title') as any;
      if (titleProp?.title?.[0]) {
        title = titleProp.title.map((t: any) => t.plain_text).join("");
      }

      const tags = Object.values(properties)
        .find((p: any) => p.type === 'multi_select' && (p.id === 'Tags' || p.name === 'Tags')) as any;
      const tagList = tags?.multi_select?.map((tag: any) => tag.name) || [];

      return {
        id: page.id,
        title,
        tags: tagList,
        url: page.url,
        lastEdited: page.last_edited_time,
        coverImage: null, // Will be populated below
      };
    });

    // Fetch images from page content for each resource
    const resourcesWithImages = await Promise.all(
      resources.map(async (resource: any) => {
        const page = allResults.find((p: any) => p.id === resource.id);

        // Extract cover image
        let coverImage = null;
        if (page?.cover) {
          if (page.cover.type === "external") {
            coverImage = page.cover.external?.url;
          } else if (page.cover.type === "file") {
            coverImage = page.cover.file?.url;
          }
        }

        // Fetch blocks (page content) to find images
        let contentImage = null;
        try {
          const blocks = await notion.blocks.children.list({
            block_id: resource.id,
            page_size: 20,
          });

          // Find the first image block
          const imageBlock = blocks.results.find((block: any) => block.type === "image");
          if (imageBlock) {
            const img = (imageBlock as any).image;
            if (img.type === "external") {
              contentImage = img.external?.url;
            } else if (img.type === "file") {
              contentImage = img.file?.url;
            }
          }
        } catch (err) {
          console.error(`Error fetching blocks for page ${resource.id}:`, err);
        }

        return {
          ...resource,
          coverImage: contentImage || coverImage, // Prefer content image
        };
      })
    );

    return NextResponse.json(resourcesWithImages);
  } catch (error: any) {
    console.error("Error fetching public resources:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      {
        error: error.message || "Unknown error occurred",
        details: error.toString(),
        type: error.constructor?.name
      },
      { status: 500 }
    );
  }
}
