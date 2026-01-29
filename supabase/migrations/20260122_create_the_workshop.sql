-- =====================================================
-- THE WORKSHOP: Member-only idea board for partnerships
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bl_workshop_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  idea_type TEXT NOT NULL CHECK (idea_type IN ('partnership', 'question', 'offer')),
  problem TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  current_assets TEXT,
  desired_outcome TEXT NOT NULL,
  needs TEXT NOT NULL,
  ideal_partner TEXT NOT NULL,
  timeline TEXT NOT NULL,
  commitment TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}'::text[],
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'paused', 'closed')),
  author_name TEXT,
  author_avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bl_workshop_ideas_user_id_idx ON public.bl_workshop_ideas(user_id);
CREATE INDEX IF NOT EXISTS bl_workshop_ideas_status_idx ON public.bl_workshop_ideas(status);
CREATE INDEX IF NOT EXISTS bl_workshop_ideas_created_at_idx ON public.bl_workshop_ideas(created_at DESC);

ALTER TABLE public.bl_workshop_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workshop ideas readable by authenticated"
ON public.bl_workshop_ideas
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Workshop ideas insert own"
ON public.bl_workshop_ideas
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Workshop ideas update own"
ON public.bl_workshop_ideas
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Workshop ideas delete own"
ON public.bl_workshop_ideas
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER bl_workshop_ideas_updated_at_trigger
  BEFORE UPDATE ON public.bl_workshop_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.bl_workshop_interest (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.bl_workshop_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  intent TEXT NOT NULL CHECK (intent IN ('interested', 'can_help', 'partner')),
  message TEXT,
  contact TEXT,
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (idea_id, user_id)
);

CREATE INDEX IF NOT EXISTS bl_workshop_interest_idea_id_idx ON public.bl_workshop_interest(idea_id);
CREATE INDEX IF NOT EXISTS bl_workshop_interest_user_id_idx ON public.bl_workshop_interest(user_id);

ALTER TABLE public.bl_workshop_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workshop hands insert own"
ON public.bl_workshop_interest
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Workshop hands view own or idea owner"
ON public.bl_workshop_interest
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1
    FROM public.bl_workshop_ideas i
    WHERE i.id = idea_id
      AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Workshop hands delete own"
ON public.bl_workshop_interest
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
