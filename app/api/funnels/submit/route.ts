import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { incrementSubmissionCount } from "@/app/apps/funnels/services/funnelService";
import { sendLeadNotificationEmail } from "@/lib/email-service";
import type { FunnelSubmission } from "@/app/apps/funnels/types";

export async function POST(req: Request) {
  try {
    const { funnelId, name, email, phone }: FunnelSubmission = await req.json();

    console.log('[SUBMIT] Form submission received:', { funnelId, name, email, phone });

    if (!funnelId || !name || !email) {
      console.error('[SUBMIT] Missing required fields:', { funnelId: !!funnelId, name: !!name, email: !!email });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    console.log('[SUBMIT] Fetching funnel:', funnelId);
    const { data: funnel, error: funnelError } = await supabase
      .from("bl_funnels_projects")
      .select("id, user_id, domain_slug")
      .eq("id", funnelId)
      .eq("status", "published")
      .single();

    if (funnelError) {
      console.error('[SUBMIT] Funnel fetch error:', funnelError);
    } else {
      console.log('[SUBMIT] Funnel found:', { id: funnel?.id, user_id: funnel?.user_id });
    }

    if (funnelError || !funnel) {
      return NextResponse.json(
        { error: "Funnel not found or not published" },
        { status: 404 }
      );
    }

    console.log('[SUBMIT] Creating contact:', { name, email });
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

    console.log('[SUBMIT] Contact creation result:', { contactError: contactError?.message, contactId: contact?.id });

    // Handle contact errors
    let contactId: string | null = null;

    if (contactError) {
      if (contactError.code === "23505") {
        // Duplicate email - fetch existing contact
        const { data: existingContact, error: fetchError } = await supabase
          .from("bl_crm_contacts")
          .select("id")
          .eq("user_id", funnel.user_id)
          .eq("email", email)
          .single();

        if (fetchError) {
          console.error("Failed to fetch existing contact:", fetchError);
          return NextResponse.json(
            { error: "Failed to save submission" },
            { status: 500 }
          );
        }

        contactId = existingContact?.id || null;

        // Update last_contacted_at
        await supabase
          .from("bl_crm_contacts")
          .update({
            last_contacted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", contactId);
      } else {
        console.error("Failed to create contact:", contactError);
        return NextResponse.json(
          { error: "Failed to save submission" },
          { status: 500 }
        );
      }
    } else {
      contactId = contact?.id || null;
    }

    // Increment submission count
    if (funnelId) {
      try {
        await incrementSubmissionCount(funnelId);
      } catch (err) {
        console.error("Failed to increment submission count:", err);
        // Don't fail the form submission if this fails
      }
    }

    // Add to funnel leads if we have a contact ID
    if (contactId) {
      console.log('[SUBMIT] Adding to funnel leads:', { funnelId, contactId });
      try {
        const { error: leadError } = await supabase.from("bl_funnels_leads").insert({
          funnel_id: funnelId,
          contact_id: contactId,
          step_id: null,
        });
        if (leadError) {
          console.error("[SUBMIT] Failed to create funnel lead link:", leadError);
        } else {
          console.log("[SUBMIT] Funnel lead created successfully");
        }
      } catch (err) {
        console.error("[SUBMIT] Failed to create funnel lead link (exception):", err);
        // Don't fail the form submission if this fails
      }
    } else {
      console.warn('[SUBMIT] No contactId, skipping funnel lead creation');
    }

    // Send email notification to funnel owner
    try {
      const { data: userData } = await supabase
        .from("bl_users")
        .select("email")
        .eq("id", funnel.user_id)
        .single();

      if (userData?.email) {
        const { data: userSettings } = await supabase
          .from("bl_users_settings")
          .select("funnel_lead_email_notifications")
          .eq("user_id", funnel.user_id)
          .single();

        const shouldSendEmail = userSettings?.funnel_lead_email_notifications !== false;

        if (shouldSendEmail) {
          // Send email asynchronously (don't block the response)
          sendLeadNotificationEmail(
            userData.email,
            funnel.domain_slug || "Funnel",
            name,
            email,
            funnelId
          ).catch(err => console.error("Failed to send lead email:", err));
        }
      }
    } catch (emailError) {
      console.error("Error processing email notification:", emailError);
      // Don't fail the form submission if email fails
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
