"use client";

import type { AgentTheme } from "@/lib/types/agent-theme";
import { Palette, Type, Layout, Sparkles } from "lucide-react";

interface ThemeControlsProps {
  theme: AgentTheme;
  onChange: (theme: AgentTheme) => void;
}

export function ThemeControls({ theme, onChange }: ThemeControlsProps) {
  const updateColors = (key: keyof AgentTheme['colors'], value: string) => {
    onChange({
      ...theme,
      colors: { ...theme.colors, [key]: value }
    });
  };

  const updateTypography = (key: keyof AgentTheme['typography'], value: string) => {
    onChange({
      ...theme,
      typography: { ...theme.typography, [key]: value }
    });
  };

  const updateLayout = (key: keyof AgentTheme['layout'], value: any) => {
    onChange({
      ...theme,
      layout: { ...theme.layout, [key]: value }
    });
  };

  const updateEffects = (key: keyof AgentTheme['effects'], value: boolean) => {
    onChange({
      ...theme,
      effects: { ...theme.effects, [key]: value }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <input
          type="text"
          value={theme.theme_name}
          onChange={(e) => onChange({ ...theme, theme_name: e.target.value })}
          className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 text-lg font-semibold border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors"
          placeholder="Theme Name"
        />
      </div>

      {/* Colors Section */}
      <section>
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Colors
        </h3>
        <div className="space-y-3">
          <ColorPicker
            label="Primary"
            value={theme.colors.primary}
            onChange={(color) => updateColors('primary', color)}
          />
          <ColorPicker
            label="Secondary"
            value={theme.colors.secondary}
            onChange={(color) => updateColors('secondary', color)}
          />
          <ColorPicker
            label="Background"
            value={theme.colors.background}
            onChange={(color) => updateColors('background', color)}
          />
          <ColorPicker
            label="User Message"
            value={theme.colors.userMessage}
            onChange={(color) => updateColors('userMessage', color)}
          />
          <ColorPicker
            label="AI Message"
            value={theme.colors.aiMessage}
            onChange={(color) => updateColors('aiMessage', color)}
          />
          <ColorPicker
            label="Text"
            value={theme.colors.text}
            onChange={(color) => updateColors('text', color)}
          />
          <ColorPicker
            label="Accent"
            value={theme.colors.accent}
            onChange={(color) => updateColors('accent', color)}
          />
        </div>
      </section>

      {/* Typography Section */}
      <section>
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Typography
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Font Family</label>
            <select
              value={theme.typography.fontFamily}
              onChange={(e) => updateTypography('fontFamily', e.target.value)}
              className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors text-sm"
            >
              <option value="Inter, system-ui, sans-serif">Inter (Sans-serif)</option>
              <option value="Georgia, serif">Georgia (Serif)</option>
              <option value="JetBrains Mono, monospace">JetBrains Mono (Monospace)</option>
              <option value="Orbitron, sans-serif">Orbitron (Display)</option>
              <option value="ui-sans-serif, system-ui">System Default</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Font Size</label>
            <select
              value={theme.typography.fontSize}
              onChange={(e) => updateTypography('fontSize', e.target.value)}
              className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors text-sm"
            >
              <option value="14px">Small (14px)</option>
              <option value="15px">Medium-Small (15px)</option>
              <option value="16px">Medium (16px)</option>
              <option value="17px">Medium-Large (17px)</option>
              <option value="18px">Large (18px)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Line Height</label>
            <select
              value={theme.typography.lineHeight}
              onChange={(e) => updateTypography('lineHeight', e.target.value)}
              className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors text-sm"
            >
              <option value="1.3">Compact (1.3)</option>
              <option value="1.5">Normal (1.5)</option>
              <option value="1.6">Comfortable (1.6)</option>
              <option value="1.8">Spacious (1.8)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Layout Section */}
      <section>
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Layout className="w-4 h-4" />
          Layout
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Layout Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['sidebar', 'fullscreen', 'compact', 'floating'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => updateLayout('type', type)}
                  className={`p-3 rounded-lg border-2 transition-all text-xs font-medium capitalize ${
                    theme.layout.type === type
                      ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Message Style</label>
            <div className="grid grid-cols-2 gap-2">
              {(['bubbles', 'cards', 'minimal', 'notion-style'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => updateLayout('messageStyle', style)}
                  className={`p-3 rounded-lg border-2 transition-all text-xs font-medium ${
                    theme.layout.messageStyle === style
                      ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {style.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Avatar Style</label>
            <div className="grid grid-cols-2 gap-2">
              {(['circular', 'square', 'hexagon', 'none'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => updateLayout('avatarStyle', style)}
                  className={`p-3 rounded-lg border-2 transition-all text-xs font-medium capitalize ${
                    theme.layout.avatarStyle === style
                      ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Spacing</label>
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'comfortable', 'spacious'] as const).map((spacing) => (
                <button
                  key={spacing}
                  onClick={() => updateLayout('spacing', spacing)}
                  className={`p-3 rounded-lg border-2 transition-all text-xs font-medium capitalize ${
                    theme.layout.spacing === spacing
                      ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {spacing}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Effects Section */}
      <section>
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Effects
        </h3>
        <div className="space-y-2">
          <Toggle
            label="Animations"
            checked={theme.effects.animations}
            onChange={(checked) => updateEffects('animations', checked)}
          />
          <Toggle
            label="Glass Effect"
            checked={theme.effects.glassEffect}
            onChange={(checked) => updateEffects('glassEffect', checked)}
          />
          <Toggle
            label="Shadows"
            checked={theme.effects.shadows}
            onChange={(checked) => updateEffects('shadows', checked)}
          />
          <Toggle
            label="Gradients"
            checked={theme.effects.gradients}
            onChange={(checked) => updateEffects('gradients', checked)}
          />
        </div>
      </section>
    </div>
  );
}

// Color Picker Component
function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-slate-400">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border-2 border-slate-700 cursor-pointer bg-slate-800"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 bg-slate-800 text-white rounded-lg px-2 py-1.5 border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors text-xs font-mono uppercase"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

// Toggle Component
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
      <span className="text-sm text-slate-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-purple-600' : 'bg-slate-600'
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        ></div>
      </button>
    </div>
  );
}
