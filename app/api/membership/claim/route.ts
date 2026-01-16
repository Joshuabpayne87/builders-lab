import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  try {
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
    const { data: existing, error: existingError } = await admin
      .from("bl_memberships")
      .select("is_paid")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      console.error("Membership lookup failed:", existingError);
      return NextResponse.json({ error: "Membership lookup failed." }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ claimed: false, isPaid: existing.is_paid });
    }

    const { data: claim, error: claimError } = await admin
      .from("bl_membership_claims")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (claimError) {
      console.error("Membership claim lookup failed:", claimError);
      return NextResponse.json({ error: "Membership claim lookup failed." }, { status: 500 });
    }

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
      console.error("Membership claim upsert failed:", upsertError);
      return NextResponse.json({ error: "Failed to claim membership." }, { status: 500 });
    }

    await admin.from("bl_membership_claims").delete().eq("email", email);

    return NextResponse.json({ claimed: true, isPaid: claim.is_paid });
  } catch (error) {
    console.error("Membership claim error:", error);
    return NextResponse.json({ error: "Membership claim error." }, { status: 500 });
  }
}
