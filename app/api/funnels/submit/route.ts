import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { incrementSubmissionCount } from "@/app/apps/funnels/services/funnelService";
import type { FunnelSubmission } from "@/app/apps/funnels/types";

export async function POST(req: Request) {
  try {
    const { funnelId, name, email, phone }: FunnelSubmission = await req.json();

    if (!funnelId || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: funnel, error: funnelError } = await supabase
      .from("bl_funnels_projects")
      .select("id, user_id, domain_slug")
      .eq("id", funnelId)
      .eq("status", "published")
      .single();

    if (funnelError || !funnel) {
      return NextResponse.json(
        { error: "Funnel not found or not published" },
        { status: 404 }
      );
    }

    const { data: contact, error: contactError } = await supabase
      .from("bl_crm_contacts")
      .insert({
        user_id: funnel.user_id,
        name,
        email,
        phone: phone || null,
        contact_type: "LEAD",
        status: "ACTIVE",
        tags: [`funnel:${funnel.domain_slug}`],
        notes: `Captured from funnel: ${funnel.domain_slug}`,
      })
      .select()
      .single();

    if (contactError) {
      if (contactError.code === "23505") {
        const { error: updateError } = await supabase
          .from("bl_crm_contacts")
          .update({
            last_contacted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", funnel.user_id)
          .eq("email", email);

        if (updateError) {
          console.error("Failed to update existing contact:", updateError);
        }
      } else {
        console.error("Failed to create contact:", contactError);
        return NextResponse.json(
          { error: "Failed to save submission" },
          { status: 500 }
        );
      }
    }

    await incrementSubmissionCount(funnelId);

    if (contact) {
      await supabase.from("bl_funnels_leads").insert({
        funnel_id: funnelId,
        contact_id: contact.id,
        step_id: null,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll be in touch soon.",
    });
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
