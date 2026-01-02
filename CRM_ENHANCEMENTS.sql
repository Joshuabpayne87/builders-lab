-- ============================================================================
-- CRM Enhancements: Workflows, Notifications, and Analytics
-- Execute this in Supabase SQL Editor after CRM_SETUP.sql
-- ============================================================================

-- Table: bl_crm_workflows
-- Stores automation workflow rules
CREATE TABLE bl_crm_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,

  -- Workflow Configuration
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT CHECK (trigger_type IN ('STALE_CONTACT', 'DEAL_STAGE_CHANGE', 'OVERDUE_TASK', 'NEW_CONTACT', 'DEAL_WON', 'DEAL_LOST')) NOT NULL,

  -- Conditions (JSON)
  conditions JSONB, -- e.g., {"days_inactive": 14, "contact_types": ["LEAD"]}

  -- Actions (JSON)
  actions JSONB NOT NULL, -- e.g., [{"type": "CREATE_TASK", "title": "Follow up"}]

  -- Status
  enabled BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bl_crm_workflows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own bl_crm_workflows" ON bl_crm_workflows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bl_crm_workflows" ON bl_crm_workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bl_crm_workflows" ON bl_crm_workflows
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bl_crm_workflows" ON bl_crm_workflows
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX bl_crm_workflows_user_id_idx ON bl_crm_workflows(user_id);
CREATE INDEX bl_crm_workflows_enabled_idx ON bl_crm_workflows(enabled);

-- ============================================================================

-- Table: bl_crm_notifications
-- Stores notifications and reminders
CREATE TABLE bl_crm_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,

  -- Notification Details
  type TEXT CHECK (type IN ('REMINDER', 'OVERDUE_TASK', 'STALE_CONTACT', 'DEAL_UPDATE', 'WORKFLOW_ACTION', 'INSIGHT')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Priority
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',

  -- Links
  contact_id UUID REFERENCES bl_crm_contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES bl_crm_deals(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES bl_crm_activities(id) ON DELETE CASCADE,

  -- Action Data (JSON)
  action_data JSONB, -- e.g., {"suggested_action": "Call contact", "url": "/contacts/123"}

  -- Status
  read BOOLEAN DEFAULT FALSE,
  dismissed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bl_crm_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own bl_crm_notifications" ON bl_crm_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bl_crm_notifications" ON bl_crm_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bl_crm_notifications" ON bl_crm_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bl_crm_notifications" ON bl_crm_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX bl_crm_notifications_user_id_idx ON bl_crm_notifications(user_id);
CREATE INDEX bl_crm_notifications_read_idx ON bl_crm_notifications(read);
CREATE INDEX bl_crm_notifications_created_at_idx ON bl_crm_notifications(created_at DESC);
CREATE INDEX bl_crm_notifications_contact_id_idx ON bl_crm_notifications(contact_id);

-- ============================================================================

-- Table: bl_crm_contact_scores
-- Stores AI-generated contact scores
CREATE TABLE bl_crm_contact_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  contact_id UUID REFERENCES bl_crm_contacts(id) ON DELETE CASCADE NOT NULL,

  -- Scores
  lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100), -- 0-100
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),

  -- Factors (JSON)
  score_factors JSONB, -- e.g., {"recency": 20, "frequency": 15, "deal_value": 30}

  -- AI Insights
  ai_reasoning TEXT,
  recommended_actions JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(contact_id)
);

-- Enable Row Level Security
ALTER TABLE bl_crm_contact_scores ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own bl_crm_contact_scores" ON bl_crm_contact_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bl_crm_contact_scores" ON bl_crm_contact_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bl_crm_contact_scores" ON bl_crm_contact_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX bl_crm_contact_scores_user_id_idx ON bl_crm_contact_scores(user_id);
CREATE INDEX bl_crm_contact_scores_contact_id_idx ON bl_crm_contact_scores(contact_id);
CREATE INDEX bl_crm_contact_scores_lead_score_idx ON bl_crm_contact_scores(lead_score DESC);

-- ============================================================================

-- Trigger: Auto-update updated_at for workflows
CREATE TRIGGER bl_crm_workflows_updated_at_trigger
  BEFORE UPDATE ON bl_crm_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at for contact scores
CREATE TRIGGER bl_crm_contact_scores_updated_at_trigger
  BEFORE UPDATE ON bl_crm_contact_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Enhancement Tables Setup Complete!
-- ============================================================================
