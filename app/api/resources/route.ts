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

    // Step 1: Retrieve the database to get its data source ID
    const database = await notion.databases.retrieve({
      database_id: PUBLIC_DATABASE_ID,
    });

    // Step 2: Get the first data source ID
    const dataSourceId = (database as any).data_sources?.[0]?.id;

    if (!dataSourceId) {
      return NextResponse.json(
        { error: "No data source found for this database. Please check your Notion database configuration." },
        { status: 500 }
      );
    }

    // Step 3: Query the data source using v5.6.0 API
    let allResults: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    while (hasMore) {
      const response: any = await (notion as any).dataSources.query({
        data_source_id: dataSourceId,
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
