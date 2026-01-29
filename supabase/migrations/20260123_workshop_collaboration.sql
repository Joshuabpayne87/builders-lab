-- =====================================================
-- THE WORKSHOP: collaboration threads, public Q&A, and hand acceptance
-- =====================================================

ALTER TABLE public.bl_workshop_interest
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES auth.users(id);

CREATE TABLE IF NOT EXISTS public.bl_workshop_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.bl_workshop_ideas(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (idea_id, participant_id)
);

CREATE INDEX IF NOT EXISTS bl_workshop_threads_owner_id_idx ON public.bl_workshop_threads(owner_id);
CREATE INDEX IF NOT EXISTS bl_workshop_threads_participant_id_idx ON public.bl_workshop_threads(participant_id);
CREATE INDEX IF NOT EXISTS bl_workshop_threads_idea_id_idx ON public.bl_workshop_threads(idea_id);

ALTER TABLE public.bl_workshop_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workshop threads select participants"
ON public.bl_workshop_threads
FOR SELECT
TO authenticated
USING (
  auth.uid() = owner_id OR auth.uid() = participant_id
);

CREATE POLICY "Workshop threads insert by owner for accepted hands"
ON public.bl_workshop_threads
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = owner_id AND
  EXISTS (
    SELECT 1
    FROM public.bl_workshop_interest i
    WHERE i.idea_id = idea_id
      AND i.user_id = participant_id
      AND i.accepted_at IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS public.bl_workshop_thread_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES public.bl_workshop_threads(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bl_workshop_thread_messages_thread_id_idx ON public.bl_workshop_thread_messages(thread_id);
CREATE INDEX IF NOT EXISTS bl_workshop_thread_messages_created_at_idx ON public.bl_workshop_thread_messages(created_at DESC);

ALTER TABLE public.bl_workshop_thread_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workshop thread messages select participants"
ON public.bl_workshop_thread_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.bl_workshop_threads t
    WHERE t.id = thread_id
      AND (t.owner_id = auth.uid() OR t.participant_id = auth.uid())
  )
);

CREATE POLICY "Workshop thread messages insert participants"
ON public.bl_workshop_thread_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1
    FROM public.bl_workshop_threads t
    WHERE t.id = thread_id
      AND (t.owner_id = auth.uid() OR t.participant_id = auth.uid())
  )
);

CREATE TABLE IF NOT EXISTS public.bl_workshop_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.bl_workshop_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  author_name TEXT,
  author_avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bl_workshop_questions_idea_id_idx ON public.bl_workshop_questions(idea_id);
CREATE INDEX IF NOT EXISTS bl_workshop_questions_created_at_idx ON public.bl_workshop_questions(created_at DESC);

ALTER TABLE public.bl_workshop_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workshop questions readable by authenticated"
ON public.bl_workshop_questions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Workshop questions insert own"
ON public.bl_workshop_questions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Workshop questions delete own"
ON public.bl_workshop_questions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Workshop hands update own"
ON public.bl_workshop_interest
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Workshop hands accept by owner"
ON public.bl_workshop_interest
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.bl_workshop_ideas i
    WHERE i.id = idea_id
      AND i.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.bl_workshop_ideas i
    WHERE i.id = idea_id
      AND i.user_id = auth.uid()
  )
);
