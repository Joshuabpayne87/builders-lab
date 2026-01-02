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
    const contact = await getContact(contactId);
    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    const activities = await getActivities({ contact_id: contactId });
    const deals = await getDeals({ contact_id: contactId });

    const summary = await generateContactSummary(contact, activities, deals);

    await saveAIAutomation({
      automation_type: "CONTACT_SUMMARY",
      contact_id: contact.id,
      input_data: { contact_id: contact.id },
      output_data: summary,
    });

    revalidatePath(`/apps/crm/contacts/${contactId}`);
    return { success: true, summary };
  } catch (error: any) {
    console.error("Generate summary error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Suggest next actions
 */
export async function suggestNextActionsAction(contactId: string) {
  try {
    const contact = await getContact(contactId);
    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    const activities = await getActivities({ contact_id: contactId });
    const deals = await getDeals({ contact_id: contactId });

    const actions = await suggestNextActions(contact, activities, deals);

    await saveAIAutomation({
      automation_type: "NEXT_ACTION",
      contact_id: contact.id,
      input_data: { contact_id: contact.id },
      output_data: { actions },
    });

    revalidatePath(`/apps/crm/contacts/${contactId}`);
    return { success: true, actions };
  } catch (error: any) {
    console.error("Suggest actions error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Draft email
 */
export async function draftEmailAction(contactId: string, purpose: string) {
  try {
    const contact = await getContact(contactId);
    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    const draft = await draftEmail(contact, purpose);

    await saveAIAutomation({
      automation_type: "EMAIL_DRAFT",
      contact_id: contact.id,
      input_data: { contact_id: contact.id, purpose },
      output_data: draft,
    });

    revalidatePath(`/apps/crm/contacts/${contactId}`);
    return { success: true, draft };
  } catch (error: any) {
    console.error("Draft email error:", error);
    return { success: false, error: error.message };
  }
}
