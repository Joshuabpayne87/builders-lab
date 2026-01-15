import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.email?.toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Missing email." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("bl_memberships")
    .select("is_paid")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ claimed: false, isPaid: existing.is_paid });
  }

  const { data: claim } = await admin
    .from("bl_membership_claims")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (!claim) {
    return NextResponse.json({ claimed: false, isPaid: false });
  }

  const { error: upsertError } = await admin
    .from("bl_memberships")
    .upsert(
      {
        user_id: user.id,
        is_paid: claim.is_paid,
        status: claim.status,
        ghost_member_id: claim.ghost_member_id,
        ghost_member_email: email,
        ghost_price_id: claim.ghost_price_id,
        ghost_last_event: claim.ghost_last_event,
        ghost_last_event_at: claim.ghost_last_event_at,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    return NextResponse.json({ error: "Failed to claim membership." }, { status: 500 });
  }

  await admin.from("bl_membership_claims").delete().eq("email", email);

  return NextResponse.json({ claimed: true, isPaid: claim.is_paid });
}
