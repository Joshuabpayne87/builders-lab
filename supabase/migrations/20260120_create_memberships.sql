CREATE TABLE IF NOT EXISTS public.bl_memberships (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT,
  ghost_member_id TEXT,
  ghost_member_email TEXT,
  ghost_price_id TEXT,
  ghost_last_event TEXT,
  ghost_last_event_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bl_memberships_is_paid_idx ON public.bl_memberships(is_paid);

ALTER TABLE public.bl_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own membership"
ON public.bl_memberships
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage memberships"
ON public.bl_memberships
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
