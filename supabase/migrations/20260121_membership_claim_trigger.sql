CREATE OR REPLACE FUNCTION public.handle_membership_claim()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claim RECORD;
  normalized_email TEXT;
BEGIN
  IF NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  normalized_email := LOWER(NEW.email);

  SELECT *
    INTO claim
    FROM public.bl_membership_claims
   WHERE email = normalized_email
   LIMIT 1;

  IF claim.email IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.bl_memberships (
    user_id,
    is_paid,
    status,
    ghost_member_id,
    ghost_member_email,
    ghost_price_id,
    ghost_last_event,
    ghost_last_event_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    claim.is_paid,
    claim.status,
    claim.ghost_member_id,
    normalized_email,
    claim.ghost_price_id,
    claim.ghost_last_event,
    claim.ghost_last_event_at,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
    SET is_paid = EXCLUDED.is_paid,
        status = EXCLUDED.status,
        ghost_member_id = EXCLUDED.ghost_member_id,
        ghost_member_email = EXCLUDED.ghost_member_email,
        ghost_price_id = EXCLUDED.ghost_price_id,
        ghost_last_event = EXCLUDED.ghost_last_event,
        ghost_last_event_at = EXCLUDED.ghost_last_event_at,
        updated_at = NOW();

  DELETE FROM public.bl_membership_claims
   WHERE email = normalized_email;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_membership ON auth.users;

CREATE TRIGGER on_auth_user_created_membership
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_membership_claim();
