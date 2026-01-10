"use client";

import { Save, RotateCcw, ChevronDown } from "lucide-react";

interface LoadoutControlsProps {
  onSave: () => void;
  onReset: () => void;
  hasChanges: boolean;
  saving?: boolean;
}

export default function LoadoutControls({ onSave, onReset, hasChanges, saving }: LoadoutControlsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Reset Button */}
      <button
        onClick={onReset}
        disabled={!hasChanges}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="text-sm font-medium">Reset</span>
      </button>

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={!hasChanges || saving}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Saving...</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span className="text-sm font-medium">Save as Default</span>
          </>
        )}
      </button>

      {/* Presets Dropdown (Future) */}
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg transition-colors opacity-50 cursor-not-allowed"
      >
        <span className="text-sm font-medium">Presets</span>
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}
