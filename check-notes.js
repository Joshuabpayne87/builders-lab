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
const PUBLIC_DATABASE_ID = process.env.PUBLIC_DATABASE_ID || process.env.NOTION_DATABASE_ID;

async function run() {
  const notion = new Client({ auth: PUBLIC_NOTION_API_KEY });
  const database = await notion.databases.retrieve({ database_id: PUBLIC_DATABASE_ID });
  const dataSourceId = database.data_sources?.[0]?.id;

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    page_size: 5,
  });

  response.results.forEach((page, i) => {
    const title = page.properties?.['Resource Title']?.title?.[0]?.plain_text || "Untitled";
    const link = page.properties?.Link?.url || "";
    console.log(`\n--- Resource ${i}: ${title} ---`);
    console.log("Link property:", link);
  });
}

run();
