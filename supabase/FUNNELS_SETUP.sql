-- Funnels App Database Setup
-- Enforces BMaD (Blueprint, Model, and Development) workflow

-- Main container for a sales funnel
CREATE TABLE bl_funnels_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    name TEXT NOT NULL,
    domain_slug TEXT UNIQUE,
    
    -- State Machine
    current_stage TEXT CHECK (current_stage IN ('IDEA', 'STRATEGY', 'CONTENT', 'BUILD', 'QA', 'PUBLISHED')) DEFAULT 'IDEA',
    
    -- Metadata
    offer_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual pages within a funnel
CREATE TABLE bl_funnels_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES bl_funnels_projects(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    name TEXT NOT NULL,
    step_type TEXT NOT NULL,
    
    -- Content Storage
    copy_content JSONB,
    ui_code TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Links leads captured in the Funnel directly to the CRM
CREATE TABLE bl_funnels_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    funnel_id UUID REFERENCES bl_funnels_projects(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES bl_crm_contacts(id),
    step_id UUID REFERENCES bl_funnels_steps(id),
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bl_funnels_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE bl_funnels_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE bl_funnels_leads ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own funnels" ON bl_funnels_projects
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own funnel steps" ON bl_funnels_steps
    FOR ALL USING (
        EXISTS (SELECT 1 FROM bl_funnels_projects WHERE id = bl_funnels_steps.project_id AND user_id = auth.uid())
    );