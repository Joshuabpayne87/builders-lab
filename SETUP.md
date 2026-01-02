# Builder's Lab - Quick Setup Guide

Your unified AI productivity suite is ready to deploy! Follow these steps to get it running.

## 📋 Pre-Setup Checklist

- ✅ Supabase Project: `ezmasjohcortyqxzwkbc`
- ✅ All tables prefixed with `bl_` to avoid conflicts
- ✅ Invite-only system enabled
- ✅ 5 apps integrated

## 🚀 Setup Steps

### 1. Configure Environment Variables

Create `.env.local` in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ezmasjohcortyqxzwkbc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**To get your Supabase keys:**
1. Go to: https://supabase.com/dashboard/project/ezmasjohcortyqxzwkbc/settings/api
2. Copy the "Project URL" (already filled in above)
3. Copy the "anon public" key
4. Paste it into `.env.local`

**To get your Gemini API key:**
1. Go to: https://ai.google.dev/
2. Create a new API key
3. Paste it into `.env.local`

### 2. Create Database Tables

Go to your Supabase SQL Editor:
https://supabase.com/dashboard/project/ezmasjohcortyqxzwkbc/sql/new

Copy and execute each table creation script from `DATABASE_SCHEMA.md`:

**Execute these in order:**
1. `bl_articles` table (for Unravel)
2. `bl_prompts` table (for PromptStash)
3. `bl_insights` table (for InsightLens)
4. `bl_images` table (for Banana Blitz)
5. `bl_invites` table (for invite system)

Each script includes:
- Table creation
- Row Level Security policies
- Indexes for performance

### 3. Make Yourself Admin

After creating the tables and signing up for an account, run this SQL:

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{is_admin}',
  'true'::jsonb
)
WHERE email = 'your-email@example.com';  -- Replace with your email
```

This gives you access to the `/admin/invites` page.

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 6. Test the App

1. **Create your account** at `/auth/signup`
2. **Make yourself admin** (step 3 above)
3. **Generate invite codes** at `/admin/invites`
4. **Test all 5 apps:**
   - Unravel - `/apps/unravel`
   - PromptStash - `/apps/promptstash`
   - InsightLens - `/apps/insightlens`
   - Banana Blitz - `/apps/banana-blitz`
   - Serendipity - `/apps/serendipity`
5. **Try the AI Assistant** at `/assistant`

## 🎯 How to Give Newsletter Subscribers Access

### Option 1: Manual Invite Generation

1. Go to `/admin/invites`
2. Enter subscriber's email (optional)
3. Set expiration (default 30 days)
4. Click "Generate"
5. Copy the invite link
6. Email it to the subscriber

### Option 2: Bulk Generation

1. Go to `/admin/invites`
2. Leave email blank
3. Set "Number of Invites" to how many you need
4. Click "Generate"
5. Copy each link and send to different subscribers

### Example Invite Email Template

```
Subject: Welcome to The Builder's Lab! 🎉

Hi [Name],

Thanks for subscribing! Here's your exclusive invite to The Builder's Lab:

👉 https://yourdomain.com/auth/signup?invite=XXXX-XXXX-XXXX

What you get:
• Unravel - Convert threads to articles
• PromptStash - AI prompt engineering
• InsightLens - Content transformation
• Banana Blitz - AI image generation
• Serendipity - Content strategy planning
• AI Assistant - Your personal AI helper

This invite expires in 30 days and can only be used once.

See you inside!
```

## 📦 Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - The Builder's Lab"
git branch -M main
git remote add origin your-github-repo-url
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GEMINI_API_KEY`
4. Click "Deploy"

### 3. Update Newsletter Link

After deploying, update this link in two places:

**File: `app/page.tsx` (line 69)**
```tsx
href="https://your-newsletter-signup-url.com"
```

**File: `app/auth/signup/page.tsx` (line 316)**
```tsx
href="https://your-newsletter-signup-url.com"
```

## 🔍 Verify Everything Works

- [ ] Can sign up with invite code
- [ ] Admin panel accessible at `/admin/invites`
- [ ] All 5 apps load and work
- [ ] Can save content (articles, prompts, insights, images)
- [ ] AI Assistant responds
- [ ] Data persists after refresh

## 📊 Database Tables

All your data is stored in these tables:
- `bl_articles` - Saved articles from Unravel
- `bl_prompts` - Saved prompts from PromptStash
- `bl_insights` - Saved insights from InsightLens
- `bl_images` - Generated images from Banana Blitz
- `bl_invites` - Invite codes for access control

You can view/manage data in Supabase Table Editor:
https://supabase.com/dashboard/project/ezmasjohcortyqxzwkbc/editor

## 🛠️ Troubleshooting

### "API Key not found"
- Check `.env.local` exists
- Verify variable names are exact
- Restart dev server: `npm run dev`

### "Table does not exist"
- Run all SQL scripts from `DATABASE_SCHEMA.md`
- Verify tables exist in Supabase Table Editor

### "RLS policy violation"
- Check Row Level Security policies are created
- Verify user is authenticated
- Check user_id matches auth.uid()

### Invite code not working
- Verify `bl_invites` table exists
- Check invite hasn't expired
- Ensure invite hasn't been used already

## 📞 Support

- Database Schema: See `DATABASE_SCHEMA.md`
- Full README: See `README.md`
- Supabase Dashboard: https://supabase.com/dashboard/project/ezmasjohcortyqxzwkbc

---

Built with Next.js 15, Supabase, and Google Gemini 🚀
