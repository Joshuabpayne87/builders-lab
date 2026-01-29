-- =====================================================
-- THE WORKSHOP: delete policies for threads and hands
-- =====================================================

CREATE POLICY "Workshop threads delete participants"
ON public.bl_workshop_threads
FOR DELETE
TO authenticated
USING (
  auth.uid() = owner_id OR auth.uid() = participant_id
);

CREATE POLICY "Workshop hands delete by owner"
ON public.bl_workshop_interest
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.bl_workshop_ideas i
    WHERE i.id = idea_id
      AND i.user_id = auth.uid()
  )
);
