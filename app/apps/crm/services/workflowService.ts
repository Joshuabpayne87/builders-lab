// CRM Workflow Service - Automated workflows and notifications
import { createClient } from "@/lib/supabase/server";
import type {
  Workflow,
  Notification,
  Contact,
  Activity,
  Deal,
  NotificationPriority,
} from "../types";

// ============================================================================
// WORKFLOW DETECTION
// ============================================================================

/**
 * Check for stale contacts (not contacted in X days)
 */
export async function detectStaleContacts(daysInactive = 14): Promise<Contact[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

  // Get contacts that haven't been contacted recently
  const { data: contacts } = await supabase
    .from("bl_crm_contacts")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "ACTIVE")
    .or(`last_contacted_at.is.null,last_contacted_at.lt.${cutoffDate.toISOString()}`);

  return (contacts as Contact[]) || [];
}

/**
 * Check for overdue tasks
 */
export async function detectOverdueTasks(): Promise<Activity[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const now = new Date().toISOString();

  const { data: activities } = await supabase
    .from("bl_crm_activities")
    .select("*")
    .eq("user_id", user.id)
    .eq("completed", false)
    .eq("activity_type", "TASK")
    .lt("due_date", now);

  return (activities as Activity[]) || [];
}

/**
 * Detect high-value deals that need attention
 */
export async function detectHighValueDeals(minValue = 10000): Promise<Deal[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: deals } = await supabase
    .from("bl_crm_deals")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "OPEN")
    .gte("value", minValue);

  return (deals as Deal[]) || [];
}

// ============================================================================
// NOTIFICATION CREATION
// ============================================================================

/**
 * Create a notification
 */
export async function createNotification(
  notification: Omit<Notification, "id" | "user_id" | "read" | "dismissed" | "created_at">
): Promise<Notification> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_crm_notifications")
    .insert({
      user_id: user.id,
      ...notification,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create notification: ${error.message}`);
  return data as Notification;
}

/**
 * Get all notifications for the current user
 */
export async function getNotifications(filters?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<Notification[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("bl_crm_notifications")
    .select("*")
    .eq("user_id", user.id)
    .eq("dismissed", false)
    .order("created_at", { ascending: false });

  if (filters?.unreadOnly) {
    query = query.eq("read", false);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);
  return (data as Notification[]) || [];
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("bl_crm_notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
}

/**
 * Dismiss notification
 */
export async function dismissNotification(notificationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("bl_crm_notifications")
    .update({ dismissed: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) throw new Error(`Failed to dismiss notification: ${error.message}`);
}

// ============================================================================
// WORKFLOW EXECUTION
// ============================================================================

/**
 * Run all automated workflows
 */
export async function runAutomatedWorkflows(): Promise<{
  staleContacts: number;
  overdueTasks: number;
  insights: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { staleContacts: 0, overdueTasks: 0, insights: 0 };

  let staleCount = 0;
  let overdueCount = 0;
  let insightCount = 0;

  // Check for stale contacts (14+ days)
  const staleContacts = await detectStaleContacts(14);
  for (const contact of staleContacts.slice(0, 5)) {
    // Limit to 5 notifications
    await createNotification({
      type: "STALE_CONTACT",
      title: "Stale Contact",
      message: `You haven't contacted ${contact.name} in over 14 days`,
      priority: "medium",
      contact_id: contact.id,
      deal_id: null,
      activity_id: null,
      action_data: {
        suggested_action: "Schedule a follow-up call",
        url: `/apps/crm/contacts/${contact.id}`,
      },
    });
    staleCount++;
  }

  // Check for overdue tasks
  const overdueTasks = await detectOverdueTasks();
  for (const task of overdueTasks.slice(0, 5)) {
    // Limit to 5 notifications
    await createNotification({
      type: "OVERDUE_TASK",
      title: "Overdue Task",
      message: `Task "${task.title}" is overdue`,
      priority: "high",
      contact_id: task.contact_id,
      deal_id: null,
      activity_id: task.id,
      action_data: {
        suggested_action: "Complete or reschedule task",
        url: `/apps/crm/contacts/${task.contact_id}`,
      },
    });
    overdueCount++;
  }

  // Check for high-value deals
  const highValueDeals = await detectHighValueDeals(10000);
  if (highValueDeals.length > 0) {
    await createNotification({
      type: "INSIGHT",
      title: "High-Value Deals",
      message: `You have ${highValueDeals.length} high-value deals in your pipeline`,
      priority: "medium",
      contact_id: null,
      deal_id: null,
      activity_id: null,
      action_data: {
        suggested_action: "Review and prioritize",
        url: "/apps/crm",
      },
    });
    insightCount++;
  }

  return {
    staleContacts: staleCount,
    overdueTasks: overdueCount,
    insights: insightCount,
  };
}
