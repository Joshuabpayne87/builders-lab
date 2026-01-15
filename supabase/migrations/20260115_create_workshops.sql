-- Create workshops table for live workshop management
CREATE TABLE IF NOT EXISTS bl_workshops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    cover_image_url TEXT,
    meeting_link TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_workshops_status ON bl_workshops(status);
CREATE INDEX idx_workshops_scheduled_at ON bl_workshops(scheduled_at);
CREATE INDEX idx_workshops_status_scheduled ON bl_workshops(status, scheduled_at);

-- Enable RLS
ALTER TABLE bl_workshops ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active workshops
CREATE POLICY "Anyone can view active workshops"
    ON bl_workshops
    FOR SELECT
    USING (status = 'active');

-- Policy: Admins can view all workshops (including archived)
CREATE POLICY "Admins can view all workshops"
    ON bl_workshops
    FOR SELECT
    USING (
        auth.jwt() ->> 'user_metadata' IS NOT NULL
        AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- Policy: Only admins can insert workshops
CREATE POLICY "Admins can insert workshops"
    ON bl_workshops
    FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'user_metadata' IS NOT NULL
        AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- Policy: Only admins can update workshops
CREATE POLICY "Admins can update workshops"
    ON bl_workshops
    FOR UPDATE
    USING (
        auth.jwt() ->> 'user_metadata' IS NOT NULL
        AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
    WITH CHECK (
        auth.jwt() ->> 'user_metadata' IS NOT NULL
        AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- Policy: Only admins can delete workshops
CREATE POLICY "Admins can delete workshops"
    ON bl_workshops
    FOR DELETE
    USING (
        auth.jwt() ->> 'user_metadata' IS NOT NULL
        AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_workshops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workshops_updated_at
    BEFORE UPDATE ON bl_workshops
    FOR EACH ROW
    EXECUTE FUNCTION update_workshops_updated_at();

-- Grant permissions
GRANT ALL ON bl_workshops TO authenticated;
GRANT SELECT ON bl_workshops TO anon;
