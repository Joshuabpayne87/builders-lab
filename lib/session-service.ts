import { createClient } from "@/lib/supabase/server";

export type AppName =
  | "banana-blitz"
  | "unravel"
  | "insightlens"
  | "promptstash"
  | "component-studio"
  | "serendipity";

export interface SaveSessionParams {
  appName: AppName;
  sessionType: string;
  title: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface Session {
  id: string;
  user_id: string;
  app_name: AppName;
  session_type: string;
  title: string;
  data: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * SessionService handles all database operations for app sessions.
 * Following the pattern established by KnowledgeService.
 */
export class SessionService {
  /**
   * Saves a new session to the database
   */
  static async save(params: SaveSessionParams): Promise<Session> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("bl_app_sessions")
      .insert({
        user_id: user.id,
        app_name: params.appName,
        session_type: params.sessionType,
        title: params.title,
        data: params.data,
        metadata: params.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Lists recent sessions across all apps
   */
  static async listAll(
    limit: number = 10
  ): Promise<Session[]> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("bl_app_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Lists sessions for a specific app with pagination
   */
  static async list(
    appName: AppName,
    limit: number = 50,
    offset: number = 0
  ): Promise<Session[]> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("bl_app_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("app_name", appName)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  /**
   * Gets a single session by ID
   */
  static async get(id: string): Promise<Session | null> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("bl_app_sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data;
  }

  /**
   * Updates an existing session
   */
  static async update(
    id: string,
    title?: string,
    data?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<Session> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const updatePayload: any = {};
    if (title !== undefined) updatePayload.title = title;
    if (data !== undefined) updatePayload.data = data;
    if (metadata !== undefined) updatePayload.metadata = metadata;

    const { data: updated, error } = await supabase
      .from("bl_app_sessions")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  /**
   * Deletes a session
   */
  static async delete(id: string): Promise<void> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
      .from("bl_app_sessions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
  }

  /**
   * Counts total sessions for an app (useful for pagination)
   */
  static async count(appName: AppName): Promise<number> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { count, error } = await supabase
      .from("bl_app_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("app_name", appName);

    if (error) throw error;
    return count || 0;
  }
}
