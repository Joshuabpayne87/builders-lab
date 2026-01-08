import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/gemini";

export type PowerupType = 'SKILL' | 'PERSONA' | 'KNOWLEDGE';

export type PowerupCategory =
  | 'marketing'
  | 'development'
  | 'research'
  | 'copywriting'
  | 'analysis'
  | 'custom';

// Content type for SKILL powerups
export interface SkillContent {
  instructions: string;
  examples?: string[];
  use_cases?: string[];
}

// Content type for PERSONA powerups
export interface PersonaContent {
  role: string;
  tone?: string;
  expertise?: string[];
  system_prompt: string;
}

// Content type for KNOWLEDGE powerups
export interface KnowledgeContent {
  file_url: string;
  file_type: string;
  file_size: number;
  processed_text: string;
  chunks?: { text: string; index: number }[];
}

export type PowerupContent = SkillContent | PersonaContent | KnowledgeContent;

export interface Powerup {
  id: string;
  powerup_type: PowerupType;
  name: string;
  description?: string;
  icon?: string;
  category?: PowerupCategory;
  content: PowerupContent;
  embedding?: number[];
  tags?: string[];
  is_active: boolean;
  usage_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePowerupParams {
  powerup_type: PowerupType;
  name: string;
  description?: string;
  icon?: string;
  category?: PowerupCategory;
  content: PowerupContent;
  tags?: string[];
  is_active?: boolean;
}

export interface UpdatePowerupParams {
  name?: string;
  description?: string;
  icon?: string;
  category?: PowerupCategory;
  content?: PowerupContent;
  tags?: string[];
  is_active?: boolean;
}

export interface PowerupFilters {
  type?: PowerupType;
  category?: PowerupCategory;
  search?: string;
  tags?: string[];
  is_active?: boolean;
}

/**
 * Server-side service for managing AI powerups
 * Handles CRUD operations, embedding generation, and search
 */
export class PowerupService {
  /**
   * Creates a new powerup (admin only)
   * Automatically generates embedding from description + content
   */
  static async create(params: CreatePowerupParams): Promise<Powerup> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) throw new Error("Forbidden: Admin access required");

    // Generate embedding for semantic search
    // Combine name, description, and relevant content for embedding
    let textForEmbedding = `${params.name} ${params.description || ''}`;

    if (params.powerup_type === 'SKILL') {
      const skillContent = params.content as SkillContent;
      textForEmbedding += ` ${skillContent.instructions}`;
    } else if (params.powerup_type === 'PERSONA') {
      const personaContent = params.content as PersonaContent;
      textForEmbedding += ` ${personaContent.role} ${personaContent.system_prompt}`;
    } else if (params.powerup_type === 'KNOWLEDGE') {
      const knowledgeContent = params.content as KnowledgeContent;
      textForEmbedding += ` ${knowledgeContent.processed_text.substring(0, 1000)}`;
    }

    const embedding = await generateEmbedding(textForEmbedding);

    // Insert into database
    const { data, error } = await supabase
      .from('bl_ai_powerups')
      .insert({
        powerup_type: params.powerup_type,
        name: params.name,
        description: params.description,
        icon: params.icon,
        category: params.category,
        content: params.content,
        embedding,
        tags: params.tags || [],
        is_active: params.is_active ?? true,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Powerup;
  }

  /**
   * Lists powerups with optional filtering
   * Returns active powerups by default (accessible to all users)
   */
  static async list(filters?: PowerupFilters, limit = 100, offset = 0): Promise<Powerup[]> {
    const supabase = await createClient();

    let query = supabase
      .from('bl_ai_powerups')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (filters?.type) {
      query = query.eq('powerup_type', filters.type);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    } else {
      // Default to active only
      query = query.eq('is_active', true);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Powerup[];
  }

  /**
   * Gets a single powerup by ID
   */
  static async get(id: string): Promise<Powerup | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('bl_ai_powerups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as Powerup;
  }

  /**
   * Gets multiple powerups by IDs
   * Useful for fetching equipped powerups
   */
  static async getMany(ids: string[]): Promise<Powerup[]> {
    if (ids.length === 0) return [];

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('bl_ai_powerups')
      .select('*')
      .in('id', ids)
      .eq('is_active', true);

    if (error) throw error;
    return (data || []) as Powerup[];
  }

  /**
   * Updates a powerup (admin only)
   * Regenerates embedding if content or description changes
   */
  static async update(id: string, params: UpdatePowerupParams): Promise<Powerup> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) throw new Error("Forbidden: Admin access required");

    // Get existing powerup
    const existing = await this.get(id);
    if (!existing) throw new Error("Powerup not found");

    // If content or description changed, regenerate embedding
    let embedding: number[] | undefined;
    if (params.description || params.content) {
      let textForEmbedding = `${params.name || existing.name} ${params.description || existing.description || ''}`;

      const content = params.content || existing.content;
      if (existing.powerup_type === 'SKILL') {
        const skillContent = content as SkillContent;
        textForEmbedding += ` ${skillContent.instructions}`;
      } else if (existing.powerup_type === 'PERSONA') {
        const personaContent = content as PersonaContent;
        textForEmbedding += ` ${personaContent.role} ${personaContent.system_prompt}`;
      } else if (existing.powerup_type === 'KNOWLEDGE') {
        const knowledgeContent = content as KnowledgeContent;
        textForEmbedding += ` ${knowledgeContent.processed_text.substring(0, 1000)}`;
      }

      embedding = await generateEmbedding(textForEmbedding);
    }

    // Update database
    const updateData: any = { ...params };
    if (embedding) {
      updateData.embedding = embedding;
    }

    const { data, error } = await supabase
      .from('bl_ai_powerups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Powerup;
  }

  /**
   * Deletes a powerup (admin only)
   * Soft delete by setting is_active = false
   */
  static async delete(id: string, hard = false): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) throw new Error("Forbidden: Admin access required");

    if (hard) {
      // Hard delete from database
      const { error } = await supabase
        .from('bl_ai_powerups')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } else {
      // Soft delete (set is_active = false)
      const { error } = await supabase
        .from('bl_ai_powerups')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    }
  }

  /**
   * Searches powerups using semantic search
   */
  static async search(query: string, filters?: PowerupFilters, limit = 10, threshold = 0.5): Promise<Powerup[]> {
    const supabase = await createClient();

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    // Build filter conditions
    let filterConditions = 'is_active = true';

    if (filters?.type) {
      filterConditions += ` AND powerup_type = '${filters.type}'`;
    }

    if (filters?.category) {
      filterConditions += ` AND category = '${filters.category}'`;
    }

    // Call RPC function for vector similarity search
    // Note: This requires a custom RPC function similar to match_knowledge
    const { data, error } = await supabase.rpc('match_powerups', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_conditions: filterConditions
    });

    if (error) {
      // If RPC function doesn't exist yet, fall back to regular list
      console.warn('match_powerups RPC not found, using fallback search');
      return this.list({ ...filters, search: query, is_active: true }, limit);
    }

    return (data || []) as Powerup[];
  }

  /**
   * Increments usage count for a powerup
   */
  static async incrementUsage(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.rpc('increment_powerup_usage', { powerup_id: id });

    if (error) {
      // If RPC doesn't exist, do it manually
      const powerup = await this.get(id);
      if (powerup) {
        await supabase
          .from('bl_ai_powerups')
          .update({ usage_count: (powerup.usage_count || 0) + 1 })
          .eq('id', id);
      }
    }
  }

  /**
   * Gets powerup categories with counts
   */
  static async getCategoryCounts(): Promise<Record<string, number>> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('bl_ai_powerups')
      .select('category')
      .eq('is_active', true);

    if (error) throw error;

    const counts: Record<string, number> = {};
    (data || []).forEach((row: any) => {
      const category = row.category || 'uncategorized';
      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  }
}
