"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Powerup } from "@/lib/powerup-service";
import { SlotConfig } from "@/lib/loadout-service";
import { X, Zap } from "lucide-react";

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
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-50, 50], [10, -10]);
  const rotateY = useTransform(mouseX, [-50, 50], [-10, 10]);

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
    <motion.div
      className="relative group"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
      whileHover={{ scale: isEmpty ? 1 : 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Slot Container */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative"
        style={{
          rotateX: isEmpty ? 0 : rotateX,
          rotateY: isEmpty ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          className={`
            relative w-36 h-36 rounded-2xl border-2 transition-all duration-300
            flex flex-col items-center justify-center p-4
            ${isEmpty
              ? isDragOver
                ? 'border-white/60 bg-white/20 shadow-2xl shadow-purple-500/50'
                : 'border-dashed border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
              : 'border-solid border-white/40 bg-gradient-to-br from-white/15 to-white/5 shadow-2xl'
            }
            overflow-hidden backdrop-blur-md
          `}
          animate={{
            boxShadow: isEmpty
              ? '0 0 0 rgba(255,255,255,0)'
              : isDragOver
              ? '0 0 40px rgba(139, 92, 246, 0.6)'
              : '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Hexagonal inner glow */}
          {!isEmpty && (
            <motion.div
              className="absolute inset-0 opacity-50"
              animate={{
                background: [
                  'radial-gradient(circle at 50% 50%, rgba(0, 243, 255, 0.2) 0%, transparent 70%)',
                  'radial-gradient(circle at 50% 50%, rgba(189, 0, 255, 0.2) 0%, transparent 70%)',
                  'radial-gradient(circle at 50% 50%, rgba(255, 0, 85, 0.2) 0%, transparent 70%)',
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* Animated ring on hover */}
          {!isEmpty && (
            <motion.div
              className="absolute inset-0 border-2 border-cyan-400/0 rounded-2xl"
              whileHover={{
                borderColor: 'rgba(34, 211, 238, 0.6)',
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          <AnimatePresence mode="wait">
            {isEmpty ? (
              // Empty slot
              <motion.div
                key="empty"
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="text-4xl mb-2 opacity-30"
                  animate={isDragOver ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, 0],
                  } : {}}
                  transition={{ duration: 0.5, repeat: isDragOver ? Infinity : 0 }}
                >
                  ⬡
                </motion.div>
                <div className="text-xs font-medium text-slate-400">{label}</div>
              </motion.div>
            ) : (
              // Equipped powerup
              <motion.div
                key="filled"
                className="text-center relative z-10"
                initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <motion.div
                  className="text-5xl mb-2"
                  style={{ transform: "translateZ(30px)" }}
                  whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  {powerup.icon || "⚡"}
                </motion.div>
                <div className="text-xs font-bold text-white text-center line-clamp-2 px-1">
                  {powerup.name}
                </div>

                {/* Particles orbiting the icon */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full"
                    style={{
                      transform: `translate(-50%, -50%)`,
                    }}
                    animate={{
                      x: [0, 30, 0, -30, 0],
                      y: [30, 0, -30, 0, 30],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.66,
                      ease: "linear",
                    }}
                  />
                ))}

                {/* Remove button */}
                <motion.button
                  onClick={onUnequip}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-600/90 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border-2 border-white/20 z-20"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ rotate: 0 }}
                >
                  <X className="w-3 h-3 text-white" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Energy pulse effect for equipped slots */}
          {!isEmpty && (
            <>
              <motion.div
                className="absolute inset-0 -z-10 rounded-2xl blur-2xl"
                animate={{
                  background: [
                    'radial-gradient(circle, rgba(0, 243, 255, 0.3) 0%, transparent 70%)',
                    'radial-gradient(circle, rgba(189, 0, 255, 0.3) 0%, transparent 70%)',
                    'radial-gradient(circle, rgba(255, 0, 85, 0.3) 0%, transparent 70%)',
                  ],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Lightning bolts */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: i * 90,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  >
                    <Zap className="w-3 h-3 text-cyan-400 -translate-x-1/2 -translate-y-1/2" style={{ transform: 'translateX(20px)' }} />
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Scan line effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </motion.div>

      {/* Label (always shown below) */}
      {!isEmpty && (
        <motion.div
          className="mt-3 text-center"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-xs font-medium text-slate-400 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
            {label}
          </div>
        </motion.div>
      )}

      {/* Drop hint */}
      <AnimatePresence>
        {isEmpty && isDragOver && (
          <motion.div
            className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-50"
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-4 py-2 rounded-full font-bold shadow-2xl border border-white/20">
              Drop to equip ⚡
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
