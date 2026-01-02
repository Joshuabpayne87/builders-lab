"use server";

import { revalidatePath } from "next/cache";
import {
  calculateContactScore,
  findDuplicateContacts,
  getContactScore,
} from "../services/enrichmentService";
import { getContact, getActivities, getDeals } from "../services/supabaseService";

/**
 * Calculate contact score
 */
export async function calculateContactScoreAction(contactId: string) {
  try {
    // Get contact with activities and deals
    const contact = await getContact(contactId);
    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    const activities = await getActivities({ contact_id: contactId });
    const deals = await getDeals({ contact_id: contactId });

    const score = await calculateContactScore(contact, activities, deals);

    revalidatePath(`/apps/crm/contacts/${contactId}`);
    return { success: true, score };
  } catch (error: any) {
    console.error("Calculate contact score error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Find duplicate contacts
 */
export async function findDuplicatesAction(contactId: string) {
  try {
    const contact = await getContact(contactId);
    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    const result = await findDuplicateContacts(contact);

    return { success: true, ...result };
  } catch (error: any) {
    console.error("Find duplicates error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get contact score
 */
export async function getContactScoreAction(contactId: string) {
  try {
    const score = await getContactScore(contactId);
    return { success: true, score };
  } catch (error: any) {
    console.error("Get contact score error:", error);
    return { success: false, error: error.message };
  }
}
