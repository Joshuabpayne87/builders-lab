"use server";

import { revalidatePath } from "next/cache";
import {
  createContact,
  updateContact,
  deleteContact,
  createActivity,
  updateActivity,
  deleteActivity,
  createDeal,
  updateDeal,
  deleteDeal,
} from "./services/supabaseService";
import type {
  ContactFormData,
  ActivityFormData,
  DealFormData,
} from "./types";

// ============================================================================
// CONTACT ACTIONS
// ============================================================================

export async function createContactAction(formData: ContactFormData) {
  try {
    const contact = await createContact(formData);
    revalidatePath("/apps/crm");
    return { success: true, data: contact };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateContactAction(
  contactId: string,
  formData: Partial<ContactFormData>
) {
  try {
    const contact = await updateContact(contactId, formData);
    revalidatePath("/apps/crm");
    return { success: true, data: contact };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteContactAction(contactId: string) {
  try {
    await deleteContact(contactId);
    revalidatePath("/apps/crm");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// ACTIVITY ACTIONS
// ============================================================================

export async function createActivityAction(formData: ActivityFormData) {
  try {
    const activity = await createActivity(formData);
    revalidatePath("/apps/crm");
    return { success: true, data: activity };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateActivityAction(
  activityId: string,
  formData: Partial<ActivityFormData>
) {
  try {
    const activity = await updateActivity(activityId, formData);
    revalidatePath("/apps/crm");
    return { success: true, data: activity };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteActivityAction(activityId: string) {
  try {
    await deleteActivity(activityId);
    revalidatePath("/apps/crm");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleActivityCompletedAction(activityId: string, completed: boolean) {
  try {
    const activity = await updateActivity(activityId, { completed });
    revalidatePath("/apps/crm");
    return { success: true, data: activity };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// DEAL ACTIONS
// ============================================================================

export async function createDealAction(formData: DealFormData) {
  try {
    const deal = await createDeal(formData);
    revalidatePath("/apps/crm");
    return { success: true, data: deal };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateDealAction(
  dealId: string,
  formData: Partial<DealFormData>
) {
  try {
    const deal = await updateDeal(dealId, formData);
    revalidatePath("/apps/crm");
    return { success: true, data: deal };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDealAction(dealId: string) {
  try {
    await deleteDeal(dealId);
    revalidatePath("/apps/crm");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateDealStageAction(dealId: string, stage: string) {
  try {
    const deal = await updateDeal(dealId, { stage: stage as any });
    revalidatePath("/apps/crm");
    return { success: true, data: deal };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
