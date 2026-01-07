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
  const notion = new Client({ auth: PUBLIC_NOTION_API_KEY });
  console.log(`Checking blocks for recursive children on Page ID: ${TARGET_PAGE_ID}`);

  try {
    const blocks = await notion.blocks.children.list({
      block_id: TARGET_PAGE_ID,
      page_size: 100,
    });
    
    console.log(`Found ${blocks.results.length} top-level blocks.`);
    
    for (const block of blocks.results) {
      console.log(`[${block.type}] ID: ${block.id} | Has Children: ${block.has_children}`);
      
      if (block.has_children) {
        console.log(`  >>> Fetching children for ${block.type}...`);
        const childBlocks = await notion.blocks.children.list({
          block_id: block.id,
          page_size: 100,
        });
        console.log(`  >>> Found ${childBlocks.results.length} children.`);
        childBlocks.results.forEach(child => {
            console.log(`      - [${child.type}] ${child.id}`);
        });
      }
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

run();
