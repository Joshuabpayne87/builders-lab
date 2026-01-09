"use client";

import { Powerup } from "@/lib/powerup-service";
import { GripVertical, Check } from "lucide-react";

interface PowerupCardProps {
  powerup: Powerup;
  isEquipped: boolean;
}

export default function PowerupCard({ powerup, isEquipped }: PowerupCardProps) {
  const getBorderColor = (type: string) => {
    switch (type) {
      case "SKILL":
        return "border-blue-600/50 bg-blue-600/10";
      case "PERSONA":
        return "border-purple-600/50 bg-purple-600/10";
      case "KNOWLEDGE":
        return "border-pink-600/50 bg-pink-600/10";
      default:
        return "border-white/10 bg-white/5";
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("powerup", JSON.stringify(powerup));
    e.dataTransfer.effectAllowed = "copy";

    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.add("opacity-50");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("opacity-50");
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        relative group cursor-move p-3 rounded-lg border transition-all
        hover:border-white/30 hover:bg-white/10
        ${getBorderColor(powerup.powerup_type)}
        ${isEquipped ? 'ring-2 ring-white/20' : ''}
      `}
    >
      {/* Drag Handle */}
      <div className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-3 h-3 text-slate-500" />
      </div>

      {/* Equipped Indicator */}
      {isEquipped && (
        <div className="absolute top-2 right-2">
          <div className="bg-green-600 rounded-full p-0.5">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{powerup.icon || "⚡"}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">
            {powerup.name}
          </h4>
          {powerup.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-1">
              {powerup.description}
            </p>
          )}
          {powerup.category && (
            <div className="mt-2">
              <span className="inline-block px-2 py-0.5 bg-white/10 rounded text-xs text-slate-400">
                {powerup.category}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Tooltip */}
      <div className="absolute left-0 top-full mt-2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
        <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-3 max-w-xs shadow-xl">
          <p className="text-xs text-slate-300">
            Drag and drop onto a slot to equip this powerup
          </p>
        </div>
      </div>
    </div>
  );
}
