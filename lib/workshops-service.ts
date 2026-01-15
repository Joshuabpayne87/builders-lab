import { createClient } from "@/lib/supabase/server";

export type WorkshopStatus = 'active' | 'archived';

export interface Workshop {
  id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  cover_image_url?: string;
  meeting_link: string;
  status: WorkshopStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkshopParams {
  title: string;
  description?: string;
  scheduled_at: string;
  cover_image_url?: string;
  meeting_link: string;
}

export interface UpdateWorkshopParams {
  title?: string;
  description?: string;
  scheduled_at?: string;
  cover_image_url?: string;
  meeting_link?: string;
  status?: WorkshopStatus;
}

export interface WorkshopFilters {
  status?: WorkshopStatus;
  includeArchived?: boolean;
}

/**
 * Server-side service for managing live workshops
 */
export class WorkshopService {
  /**
   * Creates a new workshop (admin only)
   */
  static async create(params: CreateWorkshopParams): Promise<Workshop> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) throw new Error("Only admins can create workshops");

    const { data, error } = await supabase
      .from('bl_workshops')
      .insert({
        title: params.title,
        description: params.description || null,
        scheduled_at: params.scheduled_at,
        cover_image_url: params.cover_image_url || null,
        meeting_link: params.meeting_link,
        status: 'active',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create workshop: ${error.message}`);
    return data as Workshop;
  }

  /**
   * Lists workshops with optional filters
   */
  static async list(filters?: WorkshopFilters): Promise<Workshop[]> {
    const supabase = await createClient();

    let query = supabase
      .from('bl_workshops')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else if (!filters?.includeArchived) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to list workshops: ${error.message}`);
    return (data || []) as Workshop[];
  }

  /**
   * Gets the next upcoming active workshop
   */
  static async getNextUpcoming(): Promise<Workshop | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('bl_workshops')
      .select('*')
      .eq('status', 'active')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get upcoming workshop: ${error.message}`);
    }

    return data as Workshop | null;
  }

  /**
   * Gets a single workshop by ID
   */
  static async get(id: string): Promise<Workshop | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('bl_workshops')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get workshop: ${error.message}`);
    }

    return data as Workshop | null;
  }

  /**
   * Updates a workshop (admin only)
   */
  static async update(id: string, params: UpdateWorkshopParams): Promise<Workshop> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) throw new Error("Only admins can update workshops");

    const updateData: Record<string, unknown> = {};
    if (params.title !== undefined) updateData.title = params.title;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.scheduled_at !== undefined) updateData.scheduled_at = params.scheduled_at;
    if (params.cover_image_url !== undefined) updateData.cover_image_url = params.cover_image_url;
    if (params.meeting_link !== undefined) updateData.meeting_link = params.meeting_link;
    if (params.status !== undefined) updateData.status = params.status;

    const { data, error } = await supabase
      .from('bl_workshops')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update workshop: ${error.message}`);
    return data as Workshop;
  }

  /**
   * Archives a workshop (admin only)
   */
  static async archive(id: string): Promise<Workshop> {
    return this.update(id, { status: 'archived' });
  }

  /**
   * Restores an archived workshop (admin only)
   */
  static async restore(id: string): Promise<Workshop> {
    return this.update(id, { status: 'active' });
  }

  /**
   * Deletes a workshop permanently (admin only)
   */
  static async delete(id: string): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) throw new Error("Only admins can delete workshops");

    const { error } = await supabase
      .from('bl_workshops')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete workshop: ${error.message}`);
  }
}
