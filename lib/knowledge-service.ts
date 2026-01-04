import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/gemini";

export type KnowledgeSourceApp = 
  | 'banana-blitz' 
  | 'unravel' 
  | 'serendipity' 
  | 'promptstash' 
  | 'insightlens' 
  | 'component-studio'
  | 'crm'
  | 'assistant';

export interface SaveKnowledgeParams {
  content: string;
  sourceApp: KnowledgeSourceApp;
  sourceType: string;
  sourceId?: string;
  metadata?: Record<string, any>;
}

export class KnowledgeService {
  /**
   * Saves a piece of information to the user's vector knowledge base.
   * Automatically generates an embedding and stores it.
   */
  static async save(params: SaveKnowledgeParams) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // 1. Generate Embedding
    const embedding = await generateEmbedding(params.content);

    // 2. Save to DB
    const { error } = await supabase.from('bl_knowledge_base').insert({
      user_id: user.id,
      content: params.content,
      source_app: params.sourceApp,
      source_type: params.sourceType,
      source_id: params.sourceId,
      metadata: params.metadata || {},
      embedding
    });

    if (error) throw error;
  }

  /**
   * Semantically searches the user's knowledge base.
   */
  static async search(query: string, limit = 5, threshold = 0.5) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // 1. Generate Query Embedding
    const queryEmbedding = await generateEmbedding(query);

    // 2. Call RPC function
    const { data, error } = await supabase.rpc('match_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_user_id: user.id
    });

    if (error) throw error;
    return data;
  }

  /**
   * Retrieves all knowledge entries created by the user today.
   */
  static async getTodaysKnowledge() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const { data, error } = await supabase
      .from('bl_knowledge_base')
      .select('content, source_app, source_type, created_at')
      .eq('user_id', user.id)
      .gte('created_at', today)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
}
