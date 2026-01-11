/**
 * Theme Manager - Utilities for managing user agent themes
 */

import { createClient } from "@/lib/supabase/client";
import type { AgentTheme } from "@/lib/types/agent-theme";
import { DEFAULT_THEME } from "@/lib/types/agent-theme";

/**
 * Get the active theme for a user
 */
export async function getUserActiveTheme(userId: string): Promise<AgentTheme | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_agent_themes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as AgentTheme;
}

/**
 * Get all themes for a user
 */
export async function getUserThemes(userId: string): Promise<AgentTheme[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_agent_themes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as AgentTheme[];
}

/**
 * Create or update a theme
 */
export async function saveTheme(theme: AgentTheme): Promise<AgentTheme | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const themeData = {
    user_id: user.id,
    theme_name: theme.theme_name,
    colors: theme.colors,
    typography: theme.typography,
    layout: theme.layout,
    effects: theme.effects,
    custom_css: theme.custom_css,
    is_active: theme.is_active ?? true,
    updated_at: new Date().toISOString()
  };

  if (theme.id) {
    // Update existing theme
    const { data, error } = await supabase
      .from('user_agent_themes')
      .update(themeData)
      .eq('id', theme.id)
      .select()
      .single();

    if (error) throw error;
    return data as AgentTheme;
  } else {
    // Create new theme
    const { data, error } = await supabase
      .from('user_agent_themes')
      .insert(themeData)
      .select()
      .single();

    if (error) throw error;
    return data as AgentTheme;
  }
}

/**
 * Delete a theme
 */
export async function deleteTheme(themeId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('user_agent_themes')
    .delete()
    .eq('id', themeId);

  if (error) throw error;
}

/**
 * Set a theme as active (deactivates all other themes)
 */
export async function setActiveTheme(themeId: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // The trigger will handle deactivating other themes
  const { error } = await supabase
    .from('user_agent_themes')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', themeId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Convert theme to CSS variables
 */
export function themeToCSS(theme: AgentTheme): Record<string, string> {
  return {
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-background': theme.colors.background,
    '--color-user-message': theme.colors.userMessage,
    '--color-ai-message': theme.colors.aiMessage,
    '--color-text': theme.colors.text,
    '--color-accent': theme.colors.accent,
    '--font-family': theme.typography.fontFamily,
    '--font-size': theme.typography.fontSize,
    '--line-height': theme.typography.lineHeight,
    '--spacing': theme.layout.spacing === 'compact' ? '0.5rem' : theme.layout.spacing === 'spacious' ? '2rem' : '1rem'
  };
}

/**
 * Get theme or default
 */
export async function getThemeOrDefault(): Promise<AgentTheme> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return DEFAULT_THEME;
  }

  const activeTheme = await getUserActiveTheme(user.id);
  return activeTheme || DEFAULT_THEME;
}

/**
 * Duplicate a theme
 */
export async function duplicateTheme(themeId: string, newName: string): Promise<AgentTheme | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get the theme to duplicate
  const { data: originalTheme, error: fetchError } = await supabase
    .from('user_agent_themes')
    .select('*')
    .eq('id', themeId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !originalTheme) {
    throw new Error('Theme not found');
  }

  // Create new theme with same properties but different name
  const { data: newTheme, error: createError } = await supabase
    .from('user_agent_themes')
    .insert({
      user_id: user.id,
      theme_name: newName,
      colors: originalTheme.colors,
      typography: originalTheme.typography,
      layout: originalTheme.layout,
      effects: originalTheme.effects,
      custom_css: originalTheme.custom_css,
      is_active: false
    })
    .select()
    .single();

  if (createError) throw createError;
  return newTheme as AgentTheme;
}
