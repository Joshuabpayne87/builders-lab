// CRM Supabase Service - Database Operations
import { createClient } from "@/lib/supabase/server";
import type {
  Contact,
  Activity,
  Deal,
  AIAutomation,
  ContactFormData,
  ActivityFormData,
  DealFormData,
  ContactFilters,
  ActivityFilters,
  DealFilters,
  ContactWithRelations,
} from "../types";

// ============================================================================
// CONTACTS
// ============================================================================

/**
 * Get all contacts for the current user with optional filtering
 */
export async function getContacts(filters?: ContactFilters): Promise<Contact[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("bl_crm_contacts")
    .select("*")
    .eq("user_id", user.id);

  // Apply filters
  if (filters?.contact_type && filters.contact_type.length > 0) {
    query = query.in("contact_type", filters.contact_type);
  }

  if (filters?.status && filters.status.length > 0) {
    query = query.in("status", filters.status);
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
    );
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains("tags", filters.tags);
  }

  // Apply sorting
  const sortBy = filters?.sortBy || "created_at";
  const sortOrder = filters?.sortOrder || "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch contacts: ${error.message}`);
  return data as Contact[];
}

/**
 * Get a single contact by ID
 */
export async function getContact(contactId: string): Promise<ContactWithRelations | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: contact, error: contactError } = await supabase
    .from("bl_crm_contacts")
    .select("*")
    .eq("id", contactId)
    .eq("user_id", user.id)
    .single();

  if (contactError) {
    if (contactError.code === "PGRST116") return null;
    throw new Error(`Failed to fetch contact: ${contactError.message}`);
  }

  // Fetch related activities
  const { data: activities } = await supabase
    .from("bl_crm_activities")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });

  // Fetch related deals
  const { data: deals } = await supabase
    .from("bl_crm_deals")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });

  // Calculate stats
  const totalDealValue =
    deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0;

  return {
    ...contact,
    activities: activities || [],
    deals: deals || [],
    activityCount: activities?.length || 0,
    dealCount: deals?.length || 0,
    totalDealValue,
  } as ContactWithRelations;
}

/**
 * Create a new contact
 */
export async function createContact(formData: ContactFormData): Promise<Contact> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_crm_contacts")
    .insert({
      user_id: user.id,
      ...formData,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create contact: ${error.message}`);
  return data as Contact;
}

/**
 * Update an existing contact
 */
export async function updateContact(
  contactId: string,
  formData: Partial<ContactFormData>
): Promise<Contact> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_crm_contacts")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contactId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update contact: ${error.message}`);
  return data as Contact;
}

/**
 * Delete a contact
 */
export async function deleteContact(contactId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("bl_crm_contacts")
    .delete()
    .eq("id", contactId)
    .eq("user_id", user.id);

  if (error) throw new Error(`Failed to delete contact: ${error.message}`);
}

/**
 * Update last contacted timestamp
 */
export async function updateLastContacted(contactId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("bl_crm_contacts")
    .update({
      last_contacted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", contactId)
    .eq("user_id", user.id);

  if (error)
    throw new Error(`Failed to update last contacted: ${error.message}`);
}

// ============================================================================
// ACTIVITIES
// ============================================================================

/**
 * Get activities with optional filtering
 */
export async function getActivities(filters?: ActivityFilters): Promise<Activity[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("bl_crm_activities")
    .select("*")
    .eq("user_id", user.id);

  // Apply filters
  if (filters?.contact_id) {
    query = query.eq("contact_id", filters.contact_id);
  }

  if (filters?.activity_type && filters.activity_type.length > 0) {
    query = query.in("activity_type", filters.activity_type);
  }

  if (filters?.completed !== undefined) {
    query = query.eq("completed", filters.completed);
  }

  if (filters?.dateRange) {
    query = query
      .gte("created_at", filters.dateRange.start)
      .lte("created_at", filters.dateRange.end);
  }

  // Apply sorting
  const sortBy = filters?.sortBy || "created_at";
  const sortOrder = filters?.sortOrder || "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch activities: ${error.message}`);
  return data as Activity[];
}

/**
 * Create a new activity
 */
export async function createActivity(formData: ActivityFormData): Promise<Activity> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_crm_activities")
    .insert({
      user_id: user.id,
      ...formData,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create activity: ${error.message}`);

  // Update last contacted timestamp for the contact
  if (formData.activity_type === "EMAIL" || formData.activity_type === "CALL") {
    await updateLastContacted(formData.contact_id);
  }

  return data as Activity;
}

/**
 * Update an existing activity
 */
export async function updateActivity(
  activityId: string,
  formData: Partial<ActivityFormData>
): Promise<Activity> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // If marking as completed, set completed_at timestamp
  const updates: any = { ...formData };
  if (formData.completed === true && !updates.completed_at) {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("bl_crm_activities")
    .update(updates)
    .eq("id", activityId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update activity: ${error.message}`);
  return data as Activity;
}

/**
 * Delete an activity
 */
export async function deleteActivity(activityId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("bl_crm_activities")
    .delete()
    .eq("id", activityId)
    .eq("user_id", user.id);

  if (error) throw new Error(`Failed to delete activity: ${error.message}`);
}

// ============================================================================
// DEALS
// ============================================================================

/**
 * Get deals with optional filtering
 */
export async function getDeals(filters?: DealFilters): Promise<Deal[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  let query = supabase.from("bl_crm_deals").select("*").eq("user_id", user.id);

  // Apply filters
  if (filters?.contact_id) {
    query = query.eq("contact_id", filters.contact_id);
  }

  if (filters?.status && filters.status.length > 0) {
    query = query.in("status", filters.status);
  }

  if (filters?.stage && filters.stage.length > 0) {
    query = query.in("stage", filters.stage);
  }

  if (filters?.minValue !== undefined) {
    query = query.gte("value", filters.minValue);
  }

  if (filters?.maxValue !== undefined) {
    query = query.lte("value", filters.maxValue);
  }

  // Apply sorting
  const sortBy = filters?.sortBy || "created_at";
  const sortOrder = filters?.sortOrder || "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch deals: ${error.message}`);
  return data as Deal[];
}

/**
 * Create a new deal
 */
export async function createDeal(formData: DealFormData): Promise<Deal> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_crm_deals")
    .insert({
      user_id: user.id,
      currency: formData.currency || "USD",
      ...formData,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create deal: ${error.message}`);
  return data as Deal;
}

/**
 * Update an existing deal
 */
export async function updateDeal(
  dealId: string,
  formData: Partial<DealFormData>
): Promise<Deal> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const updates: any = {
    ...formData,
    updated_at: new Date().toISOString(),
  };

  // If marking as WON or LOST, set actual_close_date
  if ((formData.status === "WON" || formData.status === "LOST") && !updates.actual_close_date) {
    updates.actual_close_date = new Date().toISOString().split("T")[0];
  }

  const { data, error } = await supabase
    .from("bl_crm_deals")
    .update(updates)
    .eq("id", dealId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update deal: ${error.message}`);
  return data as Deal;
}

/**
 * Delete a deal
 */
export async function deleteDeal(dealId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("bl_crm_deals")
    .delete()
    .eq("id", dealId)
    .eq("user_id", user.id);

  if (error) throw new Error(`Failed to delete deal: ${error.message}`);
}

// ============================================================================
// AI AUTOMATIONS
// ============================================================================

/**
 * Save AI automation result
 */
export async function saveAIAutomation(automation: Omit<AIAutomation, "id" | "created_at" | "user_id">): Promise<AIAutomation> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_crm_ai_automations")
    .insert({
      user_id: user.id,
      ...automation,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save AI automation: ${error.message}`);
  return data as AIAutomation;
}

/**
 * Get AI automations for a contact
 */
export async function getContactAIAutomations(contactId: string): Promise<AIAutomation[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_crm_ai_automations")
    .select("*")
    .eq("user_id", user.id)
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch AI automations: ${error.message}`);
  return data as AIAutomation[];
}

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get total contacts
  const { count: totalContacts } = await supabase
    .from("bl_crm_contacts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "ACTIVE");

  // Get active deals
  const { count: activeDeals } = await supabase
    .from("bl_crm_deals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "OPEN");

  // Get pipeline value
  const { data: deals } = await supabase
    .from("bl_crm_deals")
    .select("value")
    .eq("user_id", user.id)
    .eq("status", "OPEN");

  const pipelineValue = deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0;

  // Get contacts by type
  const { data: contacts } = await supabase
    .from("bl_crm_contacts")
    .select("contact_type")
    .eq("user_id", user.id)
    .eq("status", "ACTIVE");

  const contactsByType = contacts?.reduce(
    (acc, contact) => {
      acc[contact.contact_type] = (acc[contact.contact_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  ) || {};

  // Get deals by stage
  const { data: allDeals } = await supabase
    .from("bl_crm_deals")
    .select("stage")
    .eq("user_id", user.id)
    .eq("status", "OPEN");

  const dealsByStage = allDeals?.reduce(
    (acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  ) || {};

  // Get recent activities
  const { data: recentActivities } = await supabase
    .from("bl_crm_activities")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    totalContacts: totalContacts || 0,
    activeDeals: activeDeals || 0,
    pipelineValue,
    contactsByType,
    dealsByStage,
    recentActivities: recentActivities || [],
  };
}
