"use server";

import { revalidatePath } from "next/cache";
import {
  generateContactSummary,
  suggestNextActions,
  draftEmail,
} from "../services/geminiService";
import { getContact, getActivities, getDeals, saveAIAutomation } from "../services/supabaseService";

/**
 * Generate contact summary
 */
export async function generateContactSummaryAction(contactId: string) {
  try {
    console.log(`[CRM AI] Generating summary for contact: ${contactId}`);
    const contact = await getContact(contactId);
    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    const activities = await getActivities({ contact_id: contactId });
    const deals = await getDeals({ contact_id: contactId });

    const summary = await generateContactSummary(contact, activities, deals);

    try {
      await saveAIAutomation({
        automation_type: "CONTACT_SUMMARY",
        contact_id: contact.id,
        trigger_event: null,
        deal_id: null,
        input_data: { contact_id: contact.id },
        output_data: summary,
      });
    } catch (saveError) {
      console.warn("[CRM AI] Failed to save summary to DB, but returning result anyway:", saveError);
    }

    revalidatePath(`/apps/crm/contacts/${contactId}`);
    return { success: true, summary };
  } catch (error: any) {
    console.error("[CRM AI] Generate summary error:", error);
    return { success: false, error: error.message || "Failed to generate summary" };
  }
}

/**
 * Suggest next actions
 */
export async function suggestNextActionsAction(contactId: string) {
  try {
    console.log(`[CRM AI] Suggesting next actions for contact: ${contactId}`);
    const contact = await getContact(contactId);
    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    const activities = await getActivities({ contact_id: contactId });
    const deals = await getDeals({ contact_id: contactId });

    const actions = await suggestNextActions(contact, activities, deals);

    try {
      await saveAIAutomation({
        automation_type: "NEXT_ACTION",
        contact_id: contact.id,
        trigger_event: null,
        deal_id: null,
        input_data: { contact_id: contact.id },
        output_data: { actions },
      });
    } catch (saveError) {
      console.warn("[CRM AI] Failed to save actions to DB:", saveError);
    }

    revalidatePath(`/apps/crm/contacts/${contactId}`);
    return { success: true, actions };
  } catch (error: any) {
    console.error("[CRM AI] Suggest actions error:", error);
    return { success: false, error: error.message || "Failed to suggest actions" };
  }
}

/**
 * Draft email
 */
export async function draftEmailAction(contactId: string, purpose: string) {
  try {
    console.log(`[CRM AI] Drafting email for contact: ${contactId}, purpose: ${purpose}`);
    const contact = await getContact(contactId);
    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    const draft = await draftEmail(contact, purpose);

    try {
      await saveAIAutomation({
        automation_type: "EMAIL_DRAFT",
        contact_id: contact.id,
        trigger_event: null,
        deal_id: null,
        input_data: { contact_id: contact.id, purpose },
        output_data: draft,
      });
    } catch (saveError) {
      console.warn("[CRM AI] Failed to save email draft to DB:", saveError);
    }

    revalidatePath(`/apps/crm/contacts/${contactId}`);
    return { success: true, draft };
  } catch (error: any) {
    console.error("[CRM AI] Draft email error:", error);
    return { success: false, error: error.message || "Failed to draft email" };
  }
}
