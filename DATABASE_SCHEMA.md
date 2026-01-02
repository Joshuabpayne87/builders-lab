# Database Schema for The Builder's Lab

This document outlines the Supabase database schema needed for the unified app.
All tables are prefixed with `bl_` to identify them as Builder's Lab tables.

## Tables

### 1. bl_articles
Stores articles created with Unravel

```sql
CREATE TABLE bl_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  author TEXT,
  original_url TEXT,
  format TEXT CHECK (format IN ('BLOG', 'SOCIAL')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bl_articles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own articles
CREATE POLICY "Users can view own bl_articles" ON bl_articles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own articles
CREATE POLICY "Users can insert own bl_articles" ON bl_articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own articles
CREATE POLICY "Users can delete own bl_articles" ON bl_articles
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX bl_articles_user_id_idx ON bl_articles(user_id);
CREATE INDEX bl_articles_created_at_idx ON bl_articles(created_at DESC);
```

### 2. bl_prompts
Stores prompts created with PromptStash

```sql
CREATE TABLE bl_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  refined_content TEXT,
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bl_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bl_prompts" ON bl_prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bl_prompts" ON bl_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bl_prompts" ON bl_prompts
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX bl_prompts_user_id_idx ON bl_prompts(user_id);
CREATE INDEX bl_prompts_created_at_idx ON bl_prompts(created_at DESC);
```

### 3. bl_insights
Stores insights created with InsightLens

```sql
CREATE TABLE bl_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  lens_type TEXT CHECK (lens_type IN ('summary', 'mindmap', 'podcast', 'bullets')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bl_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bl_insights" ON bl_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bl_insights" ON bl_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bl_insights" ON bl_insights
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX bl_insights_user_id_idx ON bl_insights(user_id);
CREATE INDEX bl_insights_created_at_idx ON bl_insights(created_at DESC);
```

### 4. bl_images
Stores images created with Banana Blitz

```sql
CREATE TABLE bl_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bl_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bl_images" ON bl_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bl_images" ON bl_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bl_images" ON bl_images
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX bl_images_user_id_idx ON bl_images(user_id);
CREATE INDEX bl_images_created_at_idx ON bl_images(created_at DESC);
```

### 5. bl_invites
Stores invite codes for invite-only access

```sql
CREATE TABLE bl_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  email TEXT,
  used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users
);

ALTER TABLE bl_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check bl_invite validity" ON bl_invites
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create bl_invites" ON bl_invites
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own bl_invites" ON bl_invites
  FOR UPDATE USING (auth.uid() = created_by);

CREATE INDEX bl_invites_code_idx ON bl_invites(code);
CREATE INDEX bl_invites_email_idx ON bl_invites(email);
CREATE INDEX bl_invites_used_idx ON bl_invites(used);
```

### 6. bl_crm_contacts
Stores contacts/clients for the CRM app

```sql
CREATE TABLE bl_crm_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,

  -- Basic Information
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,

  -- Contact Type & Status
  contact_type TEXT CHECK (contact_type IN ('LEAD', 'PROSPECT', 'COLLABORATOR', 'PARTNER')) NOT NULL DEFAULT 'LEAD',
  status TEXT CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')) NOT NULL DEFAULT 'ACTIVE',

  -- Additional Details
  address TEXT,
  website TEXT,
  linkedin_url TEXT,
  notes TEXT,
  tags TEXT[],

  -- AI-Generated Fields
  ai_profile_summary TEXT,
  ai_insights JSONB,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contacted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE bl_crm_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bl_crm_contacts" ON bl_crm_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bl_crm_contacts" ON bl_crm_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bl_crm_contacts" ON bl_crm_contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bl_crm_contacts" ON bl_crm_contacts
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX bl_crm_contacts_user_id_idx ON bl_crm_contacts(user_id);
CREATE INDEX bl_crm_contacts_contact_type_idx ON bl_crm_contacts(contact_type);
CREATE INDEX bl_crm_contacts_status_idx ON bl_crm_contacts(status);
CREATE INDEX bl_crm_contacts_created_at_idx ON bl_crm_contacts(created_at DESC);
CREATE INDEX bl_crm_contacts_tags_idx ON bl_crm_contacts USING GIN(tags);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER bl_crm_contacts_updated_at_trigger
  BEFORE UPDATE ON bl_crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 7. bl_crm_activities
Stores activities/interactions with contacts in the CRM

```sql
CREATE TABLE bl_crm_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  contact_id UUID REFERENCES bl_crm_contacts(id) ON DELETE CASCADE NOT NULL,

  -- Activity Details
  activity_type TEXT CHECK (activity_type IN ('EMAIL', 'CALL', 'MEETING', 'NOTE', 'TASK')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Activity Status
  completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- AI-Generated Fields
  ai_summary TEXT,
  ai_next_actions JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bl_crm_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bl_crm_activities" ON bl_crm_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bl_crm_activities" ON bl_crm_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bl_crm_activities" ON bl_crm_activities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bl_crm_activities" ON bl_crm_activities
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX bl_crm_activities_user_id_idx ON bl_crm_activities(user_id);
CREATE INDEX bl_crm_activities_contact_id_idx ON bl_crm_activities(contact_id);
CREATE INDEX bl_crm_activities_activity_type_idx ON bl_crm_activities(activity_type);
CREATE INDEX bl_crm_activities_created_at_idx ON bl_crm_activities(created_at DESC);
CREATE INDEX bl_crm_activities_due_date_idx ON bl_crm_activities(due_date);
```

### 8. bl_crm_deals
Stores deals/projects for contacts in the CRM

```sql
CREATE TABLE bl_crm_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  contact_id UUID REFERENCES bl_crm_contacts(id) ON DELETE CASCADE NOT NULL,

  -- Deal Information
  title TEXT NOT NULL,
  description TEXT,
  value NUMERIC(12, 2),
  currency TEXT DEFAULT 'USD',

  -- Deal Status & Stage
  status TEXT CHECK (status IN ('OPEN', 'WON', 'LOST', 'ARCHIVED')) NOT NULL DEFAULT 'OPEN',
  stage TEXT CHECK (stage IN ('QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED')) NOT NULL DEFAULT 'QUALIFICATION',

  -- Deal Dates
  expected_close_date DATE,
  actual_close_date DATE,

  -- AI-Generated Fields
  ai_probability NUMERIC(5, 2),
  ai_insights JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bl_crm_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bl_crm_deals" ON bl_crm_deals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bl_crm_deals" ON bl_crm_deals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bl_crm_deals" ON bl_crm_deals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bl_crm_deals" ON bl_crm_deals
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX bl_crm_deals_user_id_idx ON bl_crm_deals(user_id);
CREATE INDEX bl_crm_deals_contact_id_idx ON bl_crm_deals(contact_id);
CREATE INDEX bl_crm_deals_status_idx ON bl_crm_deals(status);
CREATE INDEX bl_crm_deals_stage_idx ON bl_crm_deals(stage);
CREATE INDEX bl_crm_deals_created_at_idx ON bl_crm_deals(created_at DESC);

-- Trigger to auto-update updated_at
CREATE TRIGGER bl_crm_deals_updated_at_trigger
  BEFORE UPDATE ON bl_crm_deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 9. bl_crm_ai_automations
Stores AI automation results for the CRM

```sql
CREATE TABLE bl_crm_ai_automations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,

  -- Automation Details
  automation_type TEXT CHECK (automation_type IN ('EMAIL_DRAFT', 'NEXT_ACTION', 'DEAL_INSIGHT', 'CONTACT_SUMMARY')) NOT NULL,
  trigger_event TEXT,

  -- Input/Output
  input_data JSONB,
  output_data JSONB,

  -- Metadata
  contact_id UUID REFERENCES bl_crm_contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES bl_crm_deals(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bl_crm_ai_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bl_crm_ai_automations" ON bl_crm_ai_automations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bl_crm_ai_automations" ON bl_crm_ai_automations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX bl_crm_ai_automations_user_id_idx ON bl_crm_ai_automations(user_id);
CREATE INDEX bl_crm_ai_automations_contact_id_idx ON bl_crm_ai_automations(contact_id);
CREATE INDEX bl_crm_ai_automations_deal_id_idx ON bl_crm_ai_automations(deal_id);
CREATE INDEX bl_crm_ai_automations_created_at_idx ON bl_crm_ai_automations(created_at DESC);
```

## Setup Instructions

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/ezmasjohcortyqxzwkbc
2. Navigate to the SQL Editor
3. Copy and paste each table creation script above
4. Execute them one by one
5. Verify that all tables and policies are created successfully

## Storage Buckets (Optional Enhancement)

For Banana Blitz, you can create a storage bucket for actual image files:

```sql
-- Create a storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('bl-generated-images', 'bl-generated-images', true);

-- Policy: Users can upload their own images
CREATE POLICY "Users can upload own bl images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'bl-generated-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Anyone can view images (public bucket)
CREATE POLICY "Public can view bl images" ON storage.objects
  FOR SELECT USING (bucket_id = 'bl-generated-images');
```

## Environment Variables Required

Add these to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://ezmasjohcortyqxzwkbc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

## Admin Setup

After you sign up, mark yourself as admin:

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{is_admin}',
  'true'::jsonb
)
WHERE email = 'your-email@example.com';
```

## Notes

- All tables use UUID for primary keys
- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Indexes are created for common query patterns (user_id and created_at)
- The `analysis` field in `bl_prompts` uses JSONB for flexible storage
- All tables are prefixed with `bl_` to identify them as Builder's Lab tables
