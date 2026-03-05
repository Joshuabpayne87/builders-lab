import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/gemini";

export interface UserPreferences {
  vibes: { vibe: string; count: number }[];
  tones: { tone: string; count: number }[];
  colors: string[];
  platforms: { platform: string; count: number }[];
  contentTypes: { type: string; count: number }[];
}

export class PreferenceService {
  /**
   * Records a user preference selection
   */
  static async recordPreference(
    appName: string,
    selectionType: 'vibe' | 'tone' | 'color' | 'platform' | 'content_type',
    value: string | string[],
    metadata?: Record<string, any>
  ) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const values = Array.isArray(value) ? value : [value];

    for (const val of values) {
      const content = `User selected ${selectionType}: "${val}" in ${appName}`;

      const embedding = await generateEmbedding(content);

      const { error } = await supabase.from('bl_knowledge_base').insert({
        user_id: user.id,
        content,
        source_app: appName as any,
        source_type: `preference_${selectionType}`,
        metadata: { selectionType, value: val, ...metadata },
        embedding
      });

      if (error) console.warn("Preference record failed:", error);
    }
  }

  /**
   * Analyzes user's historical preferences
   */
  static async analyzePreferences(appName?: string): Promise<UserPreferences> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    let query = supabase
      .from('bl_knowledge_base')
      .select('source_type, metadata')
      .eq('user_id', user.id);

    if (appName) {
      query = query.eq('source_app', appName);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Parse preferences from metadata
    const vibes: Record<string, number> = {};
    const tones: Record<string, number> = {};
    const colors: Set<string> = new Set();
    const platforms: Record<string, number> = {};
    const contentTypes: Record<string, number> = {};

    data?.forEach(item => {
      const metadata = item.metadata as Record<string, any>;

      if (item.source_type === 'preference_vibe' && metadata.value) {
        vibes[metadata.value] = (vibes[metadata.value] || 0) + 1;
      }
      if (item.source_type === 'preference_tone' && metadata.value) {
        tones[metadata.value] = (tones[metadata.value] || 0) + 1;
      }
      if (item.source_type === 'preference_color' && metadata.value) {
        colors.add(metadata.value);
      }
      if (item.source_type === 'preference_platform' && metadata.value) {
        platforms[metadata.value] = (platforms[metadata.value] || 0) + 1;
      }
      if (item.source_type === 'preference_content_type' && metadata.value) {
        contentTypes[metadata.value] = (contentTypes[metadata.value] || 0) + 1;
      }
    });

    return {
      vibes: Object.entries(vibes)
        .map(([vibe, count]) => ({ vibe, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      tones: Object.entries(tones)
        .map(([tone, count]) => ({ tone, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      colors: Array.from(colors),
      platforms: Object.entries(platforms)
        .map(([platform, count]) => ({ platform, count }))
        .sort((a, b) => b.count - a.count),
      contentTypes: Object.entries(contentTypes)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
    };
  }

  /**
   * Gets recommended vibe based on usage patterns
   */
  static async getRecommendedVibe(appName?: string): Promise<string | null> {
    const prefs = await this.analyzePreferences(appName);
    return prefs.vibes[0]?.vibe || null;
  }

  /**
   * Formats preferences for AI prompt injection
   */
  static async getPreferenceContext(appName?: string): Promise<string> {
    const prefs = await this.analyzePreferences(appName);

    const parts: string[] = [];

    if (prefs.vibes.length > 0) {
      parts.push(`User's favorite visual styles: ${prefs.vibes.map(v => v.vibe).join(', ')}`);
    }

    if (prefs.tones.length > 0) {
      parts.push(`User's preferred tones: ${prefs.tones.map(t => t.tone).join(', ')}`);
    }

    if (prefs.colors.length > 0) {
      parts.push(`User's preferred colors: ${prefs.colors.join(', ')}`);
    }

    return parts.length > 0
      ? `User Preferences:\n${parts.join('\n')}\n\nAlign with these preferences when generating content.`
      : '';
  }
}
