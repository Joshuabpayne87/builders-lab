"use client";

import type { AgentTheme } from "@/lib/types/agent-theme";
import { Check } from "lucide-react";

interface PresetThemesProps {
  presets: AgentTheme[];
  currentTheme: AgentTheme;
  onSelect: (theme: AgentTheme) => void;
}

export function PresetThemes({ presets, currentTheme, onSelect }: PresetThemesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          Preset Themes
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Start with a template
        </p>
      </div>

      <div className="space-y-3">
        {presets.map((preset, index) => {
          const isSelected = preset.theme_name === currentTheme.theme_name &&
            JSON.stringify(preset.colors) === JSON.stringify(currentTheme.colors);

          return (
            <button
              key={index}
              onClick={() => onSelect(preset)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    {preset.theme_name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {preset.layout.messageStyle} • {preset.layout.type}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Color Preview */}
              <div className="flex gap-2">
                <div
                  className="w-full h-8 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${preset.colors.primary}, ${preset.colors.secondary})`
                  }}
                />
              </div>

              <div className="flex gap-1 mt-2">
                {[
                  preset.colors.background,
                  preset.colors.userMessage,
                  preset.colors.aiMessage,
                  preset.colors.accent
                ].map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 h-3 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Effects Badges */}
              <div className="flex flex-wrap gap-1 mt-3">
                {preset.effects.animations && (
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">
                    Animated
                  </span>
                )}
                {preset.effects.glassEffect && (
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">
                    Glass
                  </span>
                )}
                {preset.effects.gradients && (
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">
                    Gradients
                  </span>
                )}
                {preset.effects.shadows && (
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">
                    Shadows
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
        <p className="text-xs text-slate-400">
          💡 <span className="font-semibold text-slate-300">Tip:</span> Select a preset to start,
          then customize it to make it your own. Click "Apply Theme" to save your changes.
        </p>
      </div>
    </div>
  );
}
