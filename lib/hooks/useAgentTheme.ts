"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AgentTheme } from '@/lib/types/agent-theme';
import { DEFAULT_THEME } from '@/lib/types/agent-theme';
import { getUserActiveTheme, themeToCSS } from '@/lib/theme-manager';

/**
 * Hook to load and apply user's active theme
 * Automatically listens for real-time theme updates
 */
export function useAgentTheme() {
  const [theme, setTheme] = useState<AgentTheme>(DEFAULT_THEME);
  const [cssVars, setCssVars] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function loadTheme() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setTheme(DEFAULT_THEME);
          setCssVars(themeToCSS(DEFAULT_THEME));
          setLoading(false);
          return;
        }

        const activeTheme = await getUserActiveTheme(user.id);
        const finalTheme = activeTheme || DEFAULT_THEME;

        setTheme(finalTheme);
        setCssVars(themeToCSS(finalTheme));
        setLoading(false);

        // Set up real-time listener for theme updates
        channel = supabase
          .channel('theme-updates')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'user_agent_themes',
              filter: `user_id=eq.${user.id}`
            },
            async (payload) => {
              console.log('Theme updated:', payload);
              // Reload theme when it's updated
              const updatedTheme = await getUserActiveTheme(user.id);
              if (updatedTheme) {
                setTheme(updatedTheme);
                setCssVars(themeToCSS(updatedTheme));
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to load theme:', error);
        setTheme(DEFAULT_THEME);
        setCssVars(themeToCSS(DEFAULT_THEME));
        setLoading(false);
      }
    }

    loadTheme();

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return { theme, cssVars, loading };
}

/**
 * Hook to apply theme as inline styles to a container element
 */
export function useThemeStyles() {
  const { theme, loading } = useAgentTheme();

  const containerStyle: React.CSSProperties = {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize,
    lineHeight: theme.typography.lineHeight
  };

  const primaryButtonStyle: React.CSSProperties = {
    backgroundColor: theme.colors.primary,
    color: theme.colors.text,
    boxShadow: theme.effects.shadows ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
    backdropFilter: theme.effects.glassEffect ? 'blur(10px)' : 'none'
  };

  const userMessageStyle: React.CSSProperties = {
    backgroundColor: theme.colors.userMessage,
    color: theme.colors.text,
    boxShadow: theme.effects.shadows ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
    backdropFilter: theme.effects.glassEffect ? 'blur(10px)' : 'none'
  };

  const aiMessageStyle: React.CSSProperties = {
    backgroundColor: theme.colors.aiMessage,
    color: theme.colors.text,
    boxShadow: theme.effects.shadows ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
    backdropFilter: theme.effects.glassEffect ? 'blur(10px)' : 'none'
  };

  return {
    theme,
    loading,
    containerStyle,
    primaryButtonStyle,
    userMessageStyle,
    aiMessageStyle
  };
}
