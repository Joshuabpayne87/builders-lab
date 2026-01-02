-- ============================================================================
-- CRM Database Setup for The Builder's Lab
-- Execute this entire file in Supabase SQL Editor
-- ============================================================================

-- Table 1: bl_crm_contacts
-- Stores contact information with AI insights
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

-- Enable Row Level Security
ALTER TABLE bl_crm_contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own contacts
CREATE POLICY "Users can view own bl_crm_contacts" ON bl_crm_contacts
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert own contacts
CREATE POLICY "Users can insert own bl_crm_contacts" ON bl_crm_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update own contacts
CREATE POLICY "Users can update own bl_crm_contacts" ON bl_crm_contacts
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete own contacts
CREATE POLICY "Users can delete own bl_crm_contacts" ON bl_crm_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX bl_crm_contacts_user_id_idx ON bl_crm_contacts(user_id);
CREATE INDEX bl_crm_contacts_contact_type_idx ON bl_crm_contacts(contact_type);
CREATE INDEX bl_crm_contacts_status_idx ON bl_crm_contacts(status);
CREATE INDEX bl_crm_contacts_created_at_idx ON bl_crm_contacts(created_at DESC);
CREATE INDEX bl_crm_contacts_tags_idx ON bl_crm_contacts USING GIN(tags);

-- ============================================================================

-- Table 2: bl_crm_activities
-- Stores activities/interactions with contacts
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

-- Enable Row Level Security
ALTER TABLE bl_crm_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own activities
CREATE POLICY "Users can view own bl_crm_activities" ON bl_crm_activities
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert own activities
CREATE POLICY "Users can insert own bl_crm_activities" ON bl_crm_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update own activities
CREATE POLICY "Users can update own bl_crm_activities" ON bl_crm_activities
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete own activities
CREATE POLICY "Users can delete own bl_crm_activities" ON bl_crm_activities
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX bl_crm_activities_user_id_idx ON bl_crm_activities(user_id);
CREATE INDEX bl_crm_activities_contact_id_idx ON bl_crm_activities(contact_id);
CREATE INDEX bl_crm_activities_activity_type_idx ON bl_crm_activities(activity_type);
CREATE INDEX bl_crm_activities_created_at_idx ON bl_crm_activities(created_at DESC);
CREATE INDEX bl_crm_activities_due_date_idx ON bl_crm_activities(due_date);

-- ============================================================================

-- Table 3: bl_crm_deals
-- Stores deals/projects for contacts
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

-- Enable Row Level Security
ALTER TABLE bl_crm_deals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own deals
CREATE POLICY "Users can view own bl_crm_deals" ON bl_crm_deals
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert own deals
CREATE POLICY "Users can insert own bl_crm_deals" ON bl_crm_deals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update own deals
CREATE POLICY "Users can update own bl_crm_deals" ON bl_crm_deals
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete own deals
CREATE POLICY "Users can delete own bl_crm_deals" ON bl_crm_deals
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX bl_crm_deals_user_id_idx ON bl_crm_deals(user_id);
CREATE INDEX bl_crm_deals_contact_id_idx ON bl_crm_deals(contact_id);
CREATE INDEX bl_crm_deals_status_idx ON bl_crm_deals(status);
CREATE INDEX bl_crm_deals_stage_idx ON bl_crm_deals(stage);
CREATE INDEX bl_crm_deals_created_at_idx ON bl_crm_deals(created_at DESC);

-- ============================================================================

-- Table 4: bl_crm_ai_automations
-- Stores AI automation results
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

-- Enable Row Level Security
ALTER TABLE bl_crm_ai_automations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own automations
CREATE POLICY "Users can view own bl_crm_ai_automations" ON bl_crm_ai_automations
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert own automations
CREATE POLICY "Users can insert own bl_crm_ai_automations" ON bl_crm_ai_automations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX bl_crm_ai_automations_user_id_idx ON bl_crm_ai_automations(user_id);
CREATE INDEX bl_crm_ai_automations_contact_id_idx ON bl_crm_ai_automations(contact_id);
CREATE INDEX bl_crm_ai_automations_deal_id_idx ON bl_crm_ai_automations(deal_id);
CREATE INDEX bl_crm_ai_automations_created_at_idx ON bl_crm_ai_automations(created_at DESC);

-- ============================================================================

-- Helper Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at for contacts
CREATE TRIGGER bl_crm_contacts_updated_at_trigger
  BEFORE UPDATE ON bl_crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at for deals
CREATE TRIGGER bl_crm_deals_updated_at_trigger
  BEFORE UPDATE ON bl_crm_deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Setup Complete!
-- ============================================================================
