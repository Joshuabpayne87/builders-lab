import { createClient } from "@/lib/supabase/server";
import { MemoryEventService } from "@/lib/memory-event-service";

export type TaskStatus = "draft" | "in_progress" | "scheduled" | "completed" | "cancelled";
export type ContentPlatform = "linkedin" | "instagram" | "twitter" | "facebook" | "youtube" | "tiktok" | "blog" | "email" | "other";
export type ContentType = "image" | "carousel" | "video" | "blog_post" | "social_post" | "podcast" | "infographic" | "story" | "reel" | "other";
export type AppName = "banana-blitz" | "unravel" | "insightlens" | "promptstash" | "component-studio" | "serendipity";

export interface CalendarTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: TaskStatus;
  platform?: ContentPlatform;
  content_type?: ContentType;
  linked_session_id?: string;
  app_needed?: AppName;
  reminder_sent: boolean;
  reminder_date?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskParams {
  title: string;
  description?: string;
  due_date: string;
  status?: TaskStatus;
  platform?: ContentPlatform;
  content_type?: ContentType;
  linked_session_id?: string;
  app_needed?: AppName;
  reminder_date?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTaskParams {
  title?: string;
  description?: string;
  due_date?: string;
  status?: TaskStatus;
  platform?: ContentPlatform;
  content_type?: ContentType;
  linked_session_id?: string;
  app_needed?: AppName;
  reminder_sent?: boolean;
  reminder_date?: string;
  metadata?: Record<string, any>;
}

export interface UpcomingTask {
  id: string;
  title: string;
  due_date: string;
  status: TaskStatus;
  platform?: ContentPlatform;
  content_type?: ContentType;
  has_linked_session: boolean;
}

export interface IncompleteTask {
  id: string;
  title: string;
  due_date: string;
  platform?: ContentPlatform;
  content_type?: ContentType;
  has_linked_session: boolean;
}

export class CalendarService {
  /**
   * Create a new calendar task
   */
  static async create(params: CreateTaskParams): Promise<CalendarTask> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
      .from("bl_content_calendar")
      .insert({
        user_id: user.id,
        title: params.title,
        description: params.description,
        due_date: params.due_date,
        status: params.status || "draft",
        platform: params.platform,
        content_type: params.content_type,
        linked_session_id: params.linked_session_id,
        app_needed: params.app_needed,
        reminder_date: params.reminder_date,
        metadata: params.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    await MemoryEventService.record({
      sourceApp: "calendar",
      sourceType: "task",
      eventType: "created",
      sourceId: data.id,
      summary: `Created task: ${data.title} due ${data.due_date}`,
      metadata: {
        status: data.status,
        platform: data.platform,
        content_type: data.content_type,
      },
    });

    return data;
  }

  /**
   * Get all tasks for the current user
   */
  static async list(
    status?: TaskStatus,
    startDate?: string,
    endDate?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<CalendarTask[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    let query = supabase
      .from("bl_content_calendar")
      .select("*")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }

    if (startDate) {
      query = query.gte("due_date", startDate);
    }

    if (endDate) {
      query = query.lte("due_date", endDate);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single task by ID
   */
  static async get(id: string): Promise<CalendarTask | null> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
      .from("bl_content_calendar")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data;
  }

  /**
   * Update an existing task
   */
  static async update(id: string, params: UpdateTaskParams): Promise<CalendarTask> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
      .from("bl_content_calendar")
      .update(params)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await MemoryEventService.record({
      sourceApp: "calendar",
      sourceType: "task",
      eventType: "updated",
      sourceId: data.id,
      summary: `Updated task: ${data.title}`,
      metadata: {
        status: data.status,
        platform: data.platform,
        content_type: data.content_type,
      },
    });

    return data;
  }

  /**
   * Delete a task
   */
  static async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { error } = await supabase
      .from("bl_content_calendar")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    await MemoryEventService.record({
      sourceApp: "calendar",
      sourceType: "task",
      eventType: "deleted",
      sourceId: id,
      summary: `Deleted task: ${id}`,
    });
  }

  /**
   * Get upcoming tasks (for reminders and notifications)
   */
  static async getUpcoming(hoursAhead: number = 24): Promise<UpcomingTask[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data, error } = await supabase.rpc("get_upcoming_tasks", {
      user_uuid: user.id,
      hours_ahead: hoursAhead,
    });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get incomplete tasks (tasks past due without linked content)
   */
  static async getIncomplete(): Promise<IncompleteTask[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data, error } = await supabase.rpc("get_incomplete_tasks", {
      user_uuid: user.id,
    });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get task count by status
   */
  static async getStats(): Promise<Record<TaskStatus, number>> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
      .from("bl_content_calendar")
      .select("status")
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    const stats: Record<TaskStatus, number> = {
      draft: 0,
      in_progress: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    };

    data?.forEach((task: { status: TaskStatus }) => {
      stats[task.status]++;
    });

    return stats;
  }
}
