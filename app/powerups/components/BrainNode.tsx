"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Powerup } from "@/lib/powerup-service";
import { Brain, FileText, X, Sparkles, Zap } from "lucide-react";

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
    <motion.div
      className="relative group"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
    >
      {/* Brain Container */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative perspective-1000"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div
          className={`
            relative w-56 h-56 rounded-full border-4 transition-all duration-500
            flex flex-col items-center justify-center
            ${isEmpty
              ? isDragOver
                ? 'border-pink-400/80 bg-pink-600/20 shadow-2xl shadow-pink-500/60'
                : 'border-dashed border-pink-500/30 bg-pink-600/5 hover:border-pink-500/50 hover:bg-pink-600/10'
              : 'border-solid border-pink-400/60 bg-gradient-to-br from-pink-600/30 to-purple-600/30 shadow-2xl shadow-pink-500/40'
            }
            backdrop-blur-xl overflow-visible
          `}
          animate={{
            boxShadow: isEmpty
              ? '0 0 0 rgba(236, 72, 153, 0)'
              : [
                  '0 0 60px rgba(236, 72, 153, 0.4), 0 0 100px rgba(168, 85, 247, 0.2)',
                  '0 0 80px rgba(236, 72, 153, 0.6), 0 0 120px rgba(168, 85, 247, 0.3)',
                  '0 0 60px rgba(236, 72, 153, 0.4), 0 0 100px rgba(168, 85, 247, 0.2)',
                ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Rotating energy rings */}
          {!isEmpty && (
            <>
              <motion.div
                className="absolute inset-0 border-2 border-pink-400/30 rounded-full"
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-4 border-2 border-purple-400/30 rounded-full"
                animate={{ rotate: -360, scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-8 border-2 border-cyan-400/30 rounded-full"
                animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
            </>
          )}

          {/* Pulsing gradient background */}
          <motion.div
            className="absolute inset-0 rounded-full opacity-60"
            animate={{
              background: isEmpty ?
                'radial-gradient(circle, transparent 0%, transparent 100%)' :
                [
                  'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
                  'radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
                  'radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                  'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
                ]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          <AnimatePresence mode="wait">
            {isEmpty ? (
              // Empty brain
              <motion.div
                key="empty"
                className="text-center p-6 relative z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <motion.div
                  animate={isDragOver ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  } : {
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Brain className="w-20 h-20 text-pink-400 mx-auto mb-3" />
                </motion.div>
                <div className="text-sm font-bold text-pink-300 mb-1">Knowledge Brain</div>
                <div className="text-xs text-pink-400/70">Drop files here</div>
              </motion.div>
            ) : (
              // Brain with knowledge files
              <motion.div
                key="filled"
                className="text-center p-6 w-full relative z-10"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Brain className="w-16 h-16 text-pink-300 mx-auto mb-2" />
                </motion.div>

                <div className="flex items-center justify-center gap-1 mb-3">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <div className="text-xs font-bold text-pink-200">
                    {powerups.length} {powerups.length === 1 ? 'File' : 'Files'}
                  </div>
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                </div>

                {/* File list (scrollable if more than 3) */}
                <div className="max-h-24 overflow-y-auto space-y-1.5 px-3 custom-scrollbar">
                  {powerups.map((powerup, index) => (
                    <motion.div
                      key={powerup.id}
                      className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1.5 group/file border border-pink-500/20 hover:border-pink-500/40 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 2 }}
                    >
                      <FileText className="w-3 h-3 text-pink-400 flex-shrink-0" />
                      <span className="text-xs text-pink-100 truncate flex-1 font-medium">
                        {powerup.name}
                      </span>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnequip(powerup.id);
                        }}
                        className="opacity-0 group-hover/file:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-3 h-3 text-red-400 hover:text-red-300" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Energy particles orbiting the brain */}
          {!isEmpty && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: '6px',
                    height: '6px',
                  }}
                  animate={{
                    x: [
                      Math.cos((i * 45 * Math.PI) / 180) * 120,
                      Math.cos(((i * 45 + 360) * Math.PI) / 180) * 120,
                    ],
                    y: [
                      Math.sin((i * 45 * Math.PI) / 180) * 120,
                      Math.sin(((i * 45 + 360) * Math.PI) / 180) * 120,
                    ],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.2,
                  }}
                >
                  <motion.div
                    className={`w-2 h-2 rounded-full ${
                      i % 3 === 0 ? 'bg-pink-400' : i % 3 === 1 ? 'bg-purple-400' : 'bg-cyan-400'
                    }`}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Lightning effects for active brain */}
          {!isEmpty && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    rotate: i * 60,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.25,
                  }}
                >
                  <Zap
                    className="w-4 h-4 text-pink-400"
                    style={{
                      transform: 'translateX(90px) translateY(-50%)',
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Scan line effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent rounded-full"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Outer glow pulses */}
        {!isEmpty && (
          <>
            <motion.div
              className="absolute inset-0 -z-10 rounded-full blur-3xl"
              animate={{
                background: [
                  'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
                ],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Secondary larger glow */}
            <motion.div
              className="absolute -inset-8 -z-20 rounded-full blur-3xl opacity-50"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, transparent 70%)',
              }}
            />
          </>
        )}
      </motion.div>

      {/* Label */}
      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-sm font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Knowledge Center
        </div>
        {!isEmpty && (
          <motion.div
            className="mt-1 text-xs text-pink-400/70"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⚡ Active
          </motion.div>
        )}
      </motion.div>

      {/* Drop hint */}
      <AnimatePresence>
        {isEmpty && isDragOver && (
          <motion.div
            className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-50"
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
          >
            <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 text-white text-xs px-4 py-2 rounded-full font-bold shadow-2xl border border-white/20 flex items-center gap-1">
              <Brain className="w-3 h-3" />
              Drop knowledge file
              <Sparkles className="w-3 h-3" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(236, 72, 153, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.7);
        }
      `}</style>
    </motion.div>
  );
}
