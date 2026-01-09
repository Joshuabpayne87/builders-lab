"use client";

import { useState } from "react";
import { Powerup } from "@/lib/powerup-service";
import { SlotConfig } from "@/lib/loadout-service";
import { X } from "lucide-react";

interface PowerupSlotProps {
  slotId: keyof SlotConfig;
  label: string;
  powerup: Powerup | null;
  onEquip: (powerupId: string) => void;
  onUnequip: () => void;
}

export default function PowerupSlot({
  slotId,
  label,
  powerup,
  onEquip,
  onUnequip
}: PowerupSlotProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const powerupData = e.dataTransfer.getData("powerup");
      if (powerupData) {
        const droppedPowerup = JSON.parse(powerupData) as Powerup;

        // Only allow SKILL and PERSONA in regular slots (not KNOWLEDGE)
        if (droppedPowerup.powerup_type === "KNOWLEDGE") {
          alert("Knowledge files should be dropped in the Brain (center)");
          return;
        }

        onEquip(droppedPowerup.id);
      }
    } catch (error) {
      console.error("Failed to drop powerup:", error);
    }
  };

  const isEmpty = !powerup;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group
        ${isEmpty ? 'cursor-pointer' : ''}
      `}
    >
      {/* Slot Container */}
      <div
        className={`
          relative w-32 h-32 rounded-2xl border-2 transition-all duration-300
          flex flex-col items-center justify-center p-3
          ${isEmpty
            ? isDragOver
              ? 'border-white/60 bg-white/20 shadow-lg shadow-purple-500/50'
              : 'border-dashed border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
            : 'border-solid border-white/40 bg-gradient-to-br from-white/10 to-white/5 shadow-lg'
          }
          ${powerup ? 'hover:border-white/60' : ''}
        `}
      >
        {isEmpty ? (
          // Empty slot
          <div className="text-center">
            <div className="text-3xl mb-2 opacity-30">⬡</div>
            <div className="text-xs font-medium text-slate-400">{label}</div>
          </div>
        ) : (
          // Equipped powerup
          <>
            <div className="text-4xl mb-1">{powerup.icon || "⚡"}</div>
            <div className="text-xs font-semibold text-white text-center line-clamp-2">
              {powerup.name}
            </div>

            {/* Remove button */}
            <button
              onClick={onUnequip}
              className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-white" />
            </button>

            {/* Glow effect for equipped slot */}
            <div className="absolute inset-0 -z-10 rounded-2xl blur-xl opacity-50 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-pulse"></div>
          </>
        )}
      </div>

      {/* Label (always shown below) */}
      {!isEmpty && (
        <div className="mt-2 text-center">
          <div className="text-xs font-medium text-slate-400">{label}</div>
        </div>
      )}

      {/* Drop hint */}
      {isEmpty && isDragOver && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
            Drop to equip
          </div>
        </div>
      )}
    </div>
  );
}
