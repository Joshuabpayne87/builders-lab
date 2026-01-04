import { Client } from "@notionhq/client";

// Initialize Notion client
export const createNotionClient = () => {
  const apiKey = process.env.NOTION_API_KEY;

  if (!apiKey) {
    throw new Error("NOTION_API_KEY is not configured");
  }

  const client = new Client({ auth: apiKey });
  return client;
};

// Fetch database entries
export async function getNotionDatabase(databaseId?: string) {
  try {
    const notion = createNotionClient();
    const dbId = databaseId || process.env.NOTION_DATABASE_ID;

    if (!dbId) {
      throw new Error("NOTION_DATABASE_ID is not configured");
    }

    // Step 1: Query the database using standard API
    let allResults: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    while (hasMore) {
      const response: any = await (notion as any).databases.query({
        database_id: dbId,
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

    // Fetch blocks (content) for each page to get images
    const pagesWithImages = await Promise.all(
      allResults.map(async (page: any) => {
      // Extract properties safely
      const properties = page.properties || {};

      const titleProp = Object.values(properties).find((p: any) => p.type === 'title') as any;
      const title = titleProp?.title?.[0]?.plain_text || "Untitled";

      const statusProp = properties.Status as any;
      const status = statusProp?.status?.name || statusProp?.select?.name || "";

      const tagsProp = (properties.Tags || Object.values(properties).find((p: any) => p.type === 'multi_select')) as any;
      const tags = tagsProp?.multi_select?.map((tag: any) => tag.name) || [];

      const dateProp = properties.Date as any;
      const date = dateProp?.date?.start || page.last_edited_time;

      // Extract cover image/GIF
      let coverImage = null;
      if (page.cover) {
        if (page.cover.type === "external") {
          coverImage = page.cover.external?.url;
        } else if (page.cover.type === "file") {
          coverImage = page.cover.file?.url;
        }
      }

      // Fetch blocks (page content) to find images/GIFs
      let contentImage = null;
      try {
        const blocks = await notion.blocks.children.list({
          block_id: page.id,
          page_size: 20, // Get first 20 blocks
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
        console.error(`Error fetching blocks for page ${page.id}:`, err);
      }

      return {
        id: page.id,
        title,
        status,
        tags,
        date,
        url: page.url,
        lastEdited: page.last_edited_time,
        coverImage: contentImage || coverImage, // Use content image if available
        mediaFiles: contentImage ? [contentImage] : [],
      };
    })
    );

    return pagesWithImages;
  } catch (error) {
    console.error("Error fetching Notion database:", error);
    throw error;
  }
}

// Fetch a specific page content
export async function getNotionPage(pageId: string) {
  try {
    const notion = createNotionClient();

    const page = await notion.pages.retrieve({ page_id: pageId });
    const blocks = await notion.blocks.children.list({ block_id: pageId });

    return {
      page,
      blocks: blocks.results,
    };
  } catch (error) {
    console.error("Error fetching Notion page:", error);
    throw error;
  }
}
