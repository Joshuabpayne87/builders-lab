const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");

// Load env vars from .env.local
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/"/g, '');
      }
    });
  }
} catch (e) {
  console.log("Could not load .env.local");
}

const PUBLIC_NOTION_API_KEY = process.env.PUBLIC_NOTION_API_KEY || process.env.NOTION_API_KEY;
const TARGET_PAGE_ID = "2c2e2d7d-93a4-80c5-b1b2-da7e8498c8d8";

async function run() {
  if (!PUBLIC_NOTION_API_KEY) {
    console.error("Missing API Key");
    return;
  }

  const notion = new Client({ auth: PUBLIC_NOTION_API_KEY });

  console.log(`Checking Page ID: ${TARGET_PAGE_ID}`);

  try {
    // 1. Try to retrieve the page metadata
    console.log("Attempting to retrieve page metadata...");
    const page = await notion.pages.retrieve({ page_id: TARGET_PAGE_ID });
    console.log("Page retrieved successfully!");
    console.log("Title:", page.properties?.['Resource Title']?.title?.[0]?.plain_text || page.properties?.Name?.title?.[0]?.plain_text || "Untitled");
    
    // 2. Try to retrieve blocks (children)
    console.log("\nAttempting to retrieve page blocks...");
    const blocks = await notion.blocks.children.list({
      block_id: TARGET_PAGE_ID,
      page_size: 10,
    });
    
    console.log(`Successfully retrieved ${blocks.results.length} blocks.`);
    blocks.results.forEach((block, i) => {
        console.log(`Block ${i}: Type=${block.type}, ID=${block.id}`);
        if (block.type === 'video') {
            console.log("  Video URL:", block.video?.external?.url || block.video?.file?.url);
        } else if (block.type === 'embed') {
            console.log("  Embed URL:", block.embed?.url);
        }
    });

  } catch (error) {
    console.error("\nERROR OCCURRED:");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    if (error.body) {
        console.error("Response body:", error.body);
    }
  }
}

run();
