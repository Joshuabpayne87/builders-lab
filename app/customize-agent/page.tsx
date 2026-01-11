"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveTheme, getUserActiveTheme } from "@/lib/theme-manager";
import type { AgentTheme } from "@/lib/types/agent-theme";
import { DEFAULT_THEME, PRESET_THEMES } from "@/lib/types/agent-theme";
import { ThemeControls } from "./components/ThemeControls";
import { ChatPreview } from "./components/ChatPreview";
import { PresetThemes } from "./components/PresetThemes";
import { Sparkles, Save, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CustomizeAgentPage() {
  const [theme, setTheme] = useState<AgentTheme>(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user's active theme on mount
  useEffect(() => {
    async function loadActiveTheme() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const activeTheme = await getUserActiveTheme(user.id);
        if (activeTheme) {
          setTheme(activeTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setLoading(false);
      }
    }

    loadActiveTheme();
  }, [router]);

  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      await saveTheme(theme);

      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-fade-in flex items-center gap-3';
      notification.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-semibold">Theme applied successfully!</span>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error: any) {
      console.error('Failed to save theme:', error);
      alert('Failed to save theme: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetTheme = () => {
    if (confirm('Reset to default theme? Your changes will be lost.')) {
      setTheme(DEFAULT_THEME);
    }
  };

  const handleSelectPreset = (preset: AgentTheme) => {
    setTheme({
      ...preset,
      id: theme.id, // Keep the existing ID if any
      theme_name: preset.theme_name
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your theme...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                Customize Your AI Agent
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Design your perfect interface with live preview
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleResetTheme}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>

              <button
                onClick={handleSaveTheme}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Apply Theme
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto">
        <div className="grid grid-cols-12 gap-6 p-6">
          {/* Left Panel - Controls */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <ThemeControls theme={theme} onChange={setTheme} />
            </div>
          </div>

          {/* Center Panel - Preview */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="text-2xl">👁️</span>
                  Live Preview
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  See your changes in real-time
                </p>
              </div>
              <ChatPreview theme={theme} />
            </div>
          </div>

          {/* Right Panel - Presets */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <PresetThemes
                presets={PRESET_THEMES}
                currentTheme={theme}
                onSelect={handleSelectPreset}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Quick Actions */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-slate-900 border border-slate-700 rounded-full px-6 py-3 shadow-2xl flex items-center gap-4">
          <span className="text-sm text-slate-400">Theme: {theme.theme_name}</span>
          <div className="w-px h-6 bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Colors:</span>
            {Object.entries(theme.colors).slice(0, 4).map(([key, color]) => (
              <div
                key={key}
                className="w-6 h-6 rounded-full border-2 border-slate-700"
                style={{ backgroundColor: color }}
                title={key}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
