"use server";

import { revalidatePath } from "next/cache";
import {
  markNotificationRead,
  dismissNotification,
  runAutomatedWorkflows,
} from "../services/workflowService";

/**
 * Mark a notification as read
 */
export async function markNotificationReadAction(notificationId: string) {
  try {
    await markNotificationRead(notificationId);
    revalidatePath("/apps/crm");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Dismiss a notification
 */
export async function dismissNotificationAction(notificationId: string) {
  try {
    await dismissNotification(notificationId);
    revalidatePath("/apps/crm");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Run automated workflows
 */
export async function runWorkflowsAction() {
  try {
    const result = await runAutomatedWorkflows();
    revalidatePath("/apps/crm");
    return { success: true, ...result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
