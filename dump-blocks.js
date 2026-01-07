const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");

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
} catch (e) {}

const PUBLIC_NOTION_API_KEY = process.env.PUBLIC_NOTION_API_KEY || process.env.NOTION_API_KEY;
const TARGET_PAGE_ID = "2c2e2d7d-93a4-80c5-b1b2-da7e8498c8d8";

async function run() {
  const notion = new Client({ auth: PUBLIC_NOTION_API_KEY });
  const blocks = await notion.blocks.children.list({ block_id: TARGET_PAGE_ID });
  console.log(JSON.stringify(blocks.results, null, 2));
}

run();
