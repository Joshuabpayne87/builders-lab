# Implementation Library Setup Guide

Your Builder's Lab app now includes an **Implementation Library** that automatically syncs with your Notion database!

## 🚀 Quick Setup (5 minutes)

### Step 1: Create a Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Name it: `Builder's Lab Integration`
4. Select your workspace
5. Click **"Submit"**
6. Copy the **"Internal Integration Secret"** (starts with `secret_...`)

### Step 2: Share Your Notion Database

1. Open the Notion database you want to display
2. Click the **"..."** menu (top right)
3. Click **"Connections"** → **"Connect to"**
4. Search for and select **"Builder's Lab Integration"**

### Step 3: Get Your Database ID

Your database ID is in the URL of your Notion database:

```
https://www.notion.so/workspace/{database_id}?v=...
                              ^^^^^^^^^^^^
                              Copy this part
```

**Example:**
- URL: `https://www.notion.so/myworkspace/a1b2c3d4e5f6...?v=123`
- Database ID: `a1b2c3d4e5f6...`

### Step 4: Add to Environment Variables

Add these to your `.env.local` file:

```env
NOTION_API_KEY=secret_your_integration_secret_here
NOTION_DATABASE_ID=your_database_id_here
```

### Step 5: Restart Dev Server

```bash
# Kill the current server
# Then restart:
npm run dev
```

## 📊 Database Structure

The widget works best with these Notion database properties:

### Required:
- **Name** or **Title** (title property) - The main title of each entry

### Optional (will display if present):
- **Status** (status or select property) - Shows as a badge
- **Tags** (multi-select property) - Shows up to 2 tags
- **Date** (date property) - Shows the date

### Example Database Structure:

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Task or item name |
| Status | Status | In Progress, Done, etc. |
| Tags | Multi-select | Categories or labels |
| Date | Date | Due date or created date |

## 🎨 What You'll See

The Implementation Library includes:
- ✅ **Dashboard widget** - Quick preview of latest 10 items
- ✅ **Full library page** - Dedicated page at `/implementation-library`
- ✅ **Real-time sync** - Fetches latest data on every page load
- ✅ **Grid layout** - Beautiful card-based view of all implementations
- ✅ **Direct links** - Click any item to open in Notion
- ✅ **Dark theme** - Matches your app's professional aesthetic
- ✅ **Navigation button** - Access from top menu (Library)

## 🔧 Customization

### Change Which Database is Displayed

Update `NOTION_DATABASE_ID` in `.env.local` to point to a different database.

### Modify Display Properties

Edit `lib/notion.ts` to change which properties are extracted:

```typescript
// Current structure extracts:
- title (from Name or Title property)
- status (from Status property)
- tags (from Tags property)
- date (from Date property)
```

### Adjust Number of Items

In `lib/notion.ts`, change `page_size`:

```typescript
page_size: 10, // Change to 5, 15, 20, etc.
```

## ⚠️ Troubleshooting

### "NOTION_API_KEY is not configured"
- Check that `.env.local` exists
- Verify the variable name is exactly `NOTION_API_KEY`
- Restart your dev server

### "No entries found"
- Make sure you shared the database with your integration
- Verify the database ID is correct
- Check that the database has at least one entry

### Properties not showing
- The widget looks for common property names (Name, Title, Status, Tags, Date)
- If your properties have different names, update `lib/notion.ts` to match

### "object not found" error
- Double-check the database ID
- Ensure the integration has access to the database
- Make sure it's a database, not a page

## 📝 Notes

- The integration is **read-only** - it only fetches data, never modifies Notion
- Data is fetched fresh on every dashboard page load
- No data is stored in your app - it always pulls from Notion
- The integration respects Notion's API rate limits

## 🔐 Security

- Never commit `.env.local` to git (it's already in `.gitignore`)
- The API key is kept server-side only
- No Notion credentials are exposed to the client

---

**Need help?** Check the [Notion API docs](https://developers.notion.com/) or open an issue!
