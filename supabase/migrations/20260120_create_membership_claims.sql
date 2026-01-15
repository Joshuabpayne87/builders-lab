CREATE TABLE IF NOT EXISTS public.bl_membership_claims (
  email TEXT PRIMARY KEY,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT,
  ghost_member_id TEXT,
  ghost_price_id TEXT,
  ghost_last_event TEXT,
  ghost_last_event_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bl_membership_claims_is_paid_idx ON public.bl_membership_claims(is_paid);

ALTER TABLE public.bl_membership_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage membership claims"
ON public.bl_membership_claims
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
