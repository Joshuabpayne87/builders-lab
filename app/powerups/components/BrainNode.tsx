"use client";

import { useState } from "react";
import { Powerup } from "@/lib/powerup-service";
import { Brain, FileText, X } from "lucide-react";

interface BrainNodeProps {
  powerups: Powerup[];
  onEquip: (powerupId: string) => void;
  onUnequip: (powerupId: string) => void;
}

export default function BrainNode({ powerups, onEquip, onUnequip }: BrainNodeProps) {
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

        // Only allow KNOWLEDGE in brain
        if (droppedPowerup.powerup_type !== "KNOWLEDGE") {
          alert("Only Knowledge files can be dropped in the Brain");
          return;
        }

        onEquip(droppedPowerup.id);
      }
    } catch (error) {
      console.error("Failed to drop powerup:", error);
    }
  };

  const isEmpty = powerups.length === 0;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative group"
    >
      {/* Brain Container */}
      <div
        className={`
          relative w-48 h-48 rounded-full border-4 transition-all duration-300
          flex flex-col items-center justify-center
          ${isEmpty
            ? isDragOver
              ? 'border-pink-500/80 bg-pink-600/20 shadow-2xl shadow-pink-500/50'
              : 'border-dashed border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
            : 'border-solid border-pink-500/60 bg-gradient-to-br from-pink-600/20 to-purple-600/20 shadow-2xl shadow-pink-500/30'
          }
        `}
      >
        {isEmpty ? (
          // Empty brain
          <div className="text-center p-4">
            <Brain className="w-16 h-16 text-pink-400/50 mx-auto mb-3" />
            <div className="text-sm font-medium text-slate-400">Knowledge Brain</div>
            <div className="text-xs text-slate-500 mt-1">Drop files here</div>
          </div>
        ) : (
          // Brain with knowledge files
          <div className="text-center p-4 w-full">
            <Brain className="w-12 h-12 text-pink-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-white mb-2">
              {powerups.length} {powerups.length === 1 ? 'File' : 'Files'}
            </div>

            {/* File list (scrollable if more than 3) */}
            <div className="max-h-20 overflow-y-auto space-y-1 px-2">
              {powerups.map((powerup) => (
                <div
                  key={powerup.id}
                  className="flex items-center gap-2 bg-black/40 rounded px-2 py-1 group/file"
                >
                  <FileText className="w-3 h-3 text-pink-400 flex-shrink-0" />
                  <span className="text-xs text-slate-300 truncate flex-1">
                    {powerup.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnequip(powerup.id);
                    }}
                    className="opacity-0 group-hover/file:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-red-400 hover:text-red-300" />
                  </button>
                </div>
              ))}
            </div>

            {/* Pulsing glow */}
            <div className="absolute inset-0 -z-10 rounded-full blur-2xl opacity-60 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Label */}
      <div className="mt-3 text-center">
        <div className="text-sm font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          Knowledge Center
        </div>
      </div>

      {/* Drop hint */}
      {isEmpty && isDragOver && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="bg-pink-600 text-white text-xs px-3 py-1 rounded-full font-medium">
            Drop knowledge file
          </div>
        </div>
      )}

      {/* Orbiting particles effect (when files equipped) */}
      {!isEmpty && (
        <>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-pink-400 rounded-full animate-ping"
              style={{
                top: '50%',
                left: '50%',
                animationDelay: `${i * 0.3}s`,
                animationDuration: '2s',
              }}
            ></div>
          ))}
        </>
      )}
    </div>
  );
}
