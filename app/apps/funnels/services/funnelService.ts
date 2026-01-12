import { createClient } from "@/lib/supabase/server";
import type { Funnel, FunnelFormData } from "../types";

/**
 * Get all funnels for the current user
 */
export async function getUserFunnels(): Promise<Funnel[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_funnels_projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch funnels: ${error.message}`);
  return data as Funnel[];
}

/**
 * Get a single funnel by ID
 */
export async function getFunnel(funnelId: string): Promise<Funnel | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_funnels_projects")
    .select("*")
    .eq("id", funnelId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch funnel: ${error.message}`);
  }

  return data as Funnel;
}

/**
 * Get a funnel by slug (for public access)
 */
export async function getFunnelBySlug(slug: string): Promise<Funnel | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bl_funnels_projects")
    .select("*")
    .eq("domain_slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch funnel: ${error.message}`);
  }

  return data as Funnel;
}

/**
 * Create a new funnel
 */
export async function createFunnel(formData: FunnelFormData): Promise<Funnel> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_funnels_projects")
    .insert({
      user_id: user.id,
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create funnel: ${error.message}`);
  return data as Funnel;
}

/**
 * Update an existing funnel
 */
export async function updateFunnel(
  funnelId: string,
  formData: Partial<FunnelFormData>
): Promise<Funnel> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_funnels_projects")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", funnelId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update funnel: ${error.message}`);
  return data as Funnel;
}

/**
 * Increment submission count
 */
export async function incrementSubmissionCount(funnelId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("increment_funnel_submissions", {
    funnel_id: funnelId,
  });

  if (error) {
    // Fallback: manual increment if RPC doesn't exist
    const { data: funnel } = await supabase
      .from("bl_funnels_projects")
      .select("submission_count")
      .eq("id", funnelId)
      .single();

    if (funnel) {
      await supabase
        .from("bl_funnels_projects")
        .update({
          submission_count: (funnel.submission_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", funnelId);
    }
  }
}

/**
 * Check if slug is available
 */
export async function isSlugAvailable(slug: string, excludeFunnelId?: string): Promise<boolean> {
  const supabase = await createClient();

  let query = supabase
    .from("bl_funnels_projects")
    .select("id")
    .eq("domain_slug", slug);

  if (excludeFunnelId) {
    query = query.neq("id", excludeFunnelId);
  }

  const { data } = await query.single();

  return !data;
}

/**
 * Generate unique slug from title
 */
export function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);

  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${randomSuffix}`;
}
