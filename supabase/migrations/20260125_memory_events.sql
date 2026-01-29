-- =====================================================
-- MEMORY EVENTS: user-scoped event log for agent memory
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bl_memory_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_app TEXT NOT NULL,
  source_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  source_id TEXT,
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  importance INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bl_memory_events_user_id_idx ON public.bl_memory_events(user_id);
CREATE INDEX IF NOT EXISTS bl_memory_events_created_at_idx ON public.bl_memory_events(created_at DESC);
CREATE INDEX IF NOT EXISTS bl_memory_events_source_app_idx ON public.bl_memory_events(source_app);
CREATE INDEX IF NOT EXISTS bl_memory_events_source_type_idx ON public.bl_memory_events(source_type);

ALTER TABLE public.bl_memory_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Memory events select own"
ON public.bl_memory_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Memory events insert own"
ON public.bl_memory_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Memory events delete own"
ON public.bl_memory_events
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
