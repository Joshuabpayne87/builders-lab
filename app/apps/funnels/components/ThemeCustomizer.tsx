"use client";

import { useState } from "react";

interface ThemeCustomizerProps {
  htmlCode: string;
  onApply: (updatedHtml: string) => void;
}

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

export default function ThemeCustomizer({ htmlCode, onApply }: ThemeCustomizerProps) {
  const [colors, setColors] = useState<ThemeColors>({
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    background: "#ffffff",
    text: "#1f2937",
    accent: "#10b981",
  });

  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("system-ui");

  const applyTheme = () => {
    let updatedHtml = htmlCode;

    const colorMap: Record<string, string> = {
      "bg-blue-600": `bg-[${colors.primary}]`,
      "bg-blue-500": `bg-[${colors.primary}]`,
      "text-blue-600": `text-[${colors.primary}]`,
      "border-blue-600": `border-[${colors.primary}]`,
      "bg-purple-600": `bg-[${colors.secondary}]`,
      "bg-green-600": `bg-[${colors.accent}]`,
      "text-gray-900": `text-[${colors.text}]`,
      "text-gray-800": `text-[${colors.text}]`,
      "bg-white": `bg-[${colors.background}]`,
    };

    Object.entries(colorMap).forEach(([oldClass, newClass]) => {
      const regex = new RegExp(oldClass, "g");
      updatedHtml = updatedHtml.replace(regex, newClass);
    });

    if (fontFamily !== "system-ui") {
      updatedHtml = updatedHtml.replace(
        /<style>/,
        `<style>\n  @import url('https://fonts.googleapis.com/css2?family=${fontFamily.replace(" ", "+")}:wght@400;500;600;700&display=swap');\n  body { font-family: '${fontFamily}', sans-serif; font-size: ${fontSize}px; }`
      );
    } else {
      updatedHtml = updatedHtml.replace(
        /<style>/,
        `<style>\n  body { font-size: ${fontSize}px; }`
      );
    }

    onApply(updatedHtml);
  };

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg border border-gray-200">
      <div>
        <h3 className="text-lg font-semibold mb-4">Theme Customizer</h3>
        <p className="text-sm text-gray-600 mb-4">
          Customize colors, fonts, and styling for your landing page
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Primary Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={colors.primary}
              onChange={(e) => setColors({ ...colors, primary: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300"
            />
            <input
              type="text"
              value={colors.primary}
              onChange={(e) => setColors({ ...colors, primary: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Secondary Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={colors.secondary}
              onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300"
            />
            <input
              type="text"
              value={colors.secondary}
              onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Accent Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={colors.accent}
              onChange={(e) => setColors({ ...colors, accent: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300"
            />
            <input
              type="text"
              value={colors.accent}
              onChange={(e) => setColors({ ...colors, accent: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Background Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={colors.background}
              onChange={(e) => setColors({ ...colors, background: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300"
            />
            <input
              type="text"
              value={colors.background}
              onChange={(e) => setColors({ ...colors, background: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Text Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={colors.text}
              onChange={(e) => setColors({ ...colors, text: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300"
            />
            <input
              type="text"
              value={colors.text}
              onChange={(e) => setColors({ ...colors, text: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Font Family</label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="system-ui">System Default</option>
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Poppins">Poppins</option>
            <option value="Playfair Display">Playfair Display</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Base Font Size: {fontSize}px</label>
          <input
            type="range"
            min="12"
            max="20"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <button
        onClick={applyTheme}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Apply Theme
      </button>
    </div>
  );
}
