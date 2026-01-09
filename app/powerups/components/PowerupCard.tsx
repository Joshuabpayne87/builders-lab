"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Powerup } from "@/lib/powerup-service";
import { GripVertical, Check, Sparkles } from "lucide-react";

interface PowerupCardProps {
  powerup: Powerup;
  isEquipped: boolean;
}

export default function PowerupCard({ powerup, isEquipped }: PowerupCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [8, -8]);
  const rotateY = useTransform(x, [-50, 50], [-8, 8]);

  const getBorderColor = (type: string) => {
    switch (type) {
      case "SKILL":
        return "from-blue-500 via-blue-600 to-blue-500";
      case "PERSONA":
        return "from-purple-500 via-purple-600 to-purple-500";
      case "KNOWLEDGE":
        return "from-pink-500 via-pink-600 to-pink-500";
      default:
        return "from-slate-500 via-slate-600 to-slate-500";
    }
  };

  const getGlowColor = (type: string) => {
    switch (type) {
      case "SKILL":
        return "shadow-blue-500/50";
      case "PERSONA":
        return "shadow-purple-500/50";
      case "KNOWLEDGE":
        return "shadow-pink-500/50";
      default:
        return "shadow-slate-500/50";
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("powerup", JSON.stringify(powerup));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("opacity-50");
  };

  return (
    <motion.div
      className="relative group perspective-1000"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        draggable
        drag={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`
          relative cursor-move p-4 rounded-xl
          bg-gradient-to-br from-black/40 via-black/20 to-black/40
          backdrop-blur-xl border border-white/10
          transition-all duration-300
          hover:border-white/30
          ${isEquipped ? 'ring-2 ring-white/40' : ''}
          overflow-hidden
          group-hover:shadow-2xl
          ${getGlowColor(powerup.powerup_type)}
        `}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Animated gradient border on hover */}
        <motion.div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
          style={{
            background: `linear-gradient(135deg, ${getBorderColor(powerup.powerup_type).replace('from-', '').replace(' via-', ', ').replace(' to-', ', ')})`,
            filter: 'blur(20px)',
          }}
        />

        {/* Shine effect on hover */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%", skewX: -20 }}
          whileHover={{ x: "200%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {/* Drag Handle */}
        <motion.div
          className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <GripVertical className="w-4 h-4 text-slate-400" />
        </motion.div>

        {/* Equipped Indicator */}
        {isEquipped && (
          <motion.div
            className="absolute top-2 right-2 z-10"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-md animate-pulse"></div>
              <div className="relative bg-green-600 rounded-full p-1.5 border-2 border-green-400">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Content */}
        <div className="flex items-start gap-3 relative z-10">
          <motion.div
            className="text-3xl flex-shrink-0"
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
            style={{ transform: "translateZ(20px)" }}
          >
            {powerup.icon || "⚡"}
          </motion.div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate mb-1 flex items-center gap-1">
              {powerup.name}
              {powerup.usage_count && powerup.usage_count > 10 && (
                <Sparkles className="w-3 h-3 text-yellow-400" />
              )}
            </h4>

            {powerup.description && (
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {powerup.description}
              </p>
            )}

            {powerup.category && (
              <motion.div
                className="mt-2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="inline-block px-2 py-0.5 bg-white/10 rounded-md text-xs text-slate-300 font-medium backdrop-blur-sm border border-white/10">
                  {powerup.category}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Floating particles on hover */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ x: "50%", y: "50%", opacity: 0 }}
              whileHover={{
                x: `${50 + Math.random() * 50 - 25}%`,
                y: `${50 + Math.random() * 50 - 25}%`,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Glow effect for powerup type */}
        <div className={`absolute inset-0 -z-10 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 bg-gradient-to-br ${getBorderColor(powerup.powerup_type)}`} />
      </motion.div>

      {/* Hover Tooltip */}
      <motion.div
        className="absolute left-0 top-full mt-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100"
        initial={{ y: -10 }}
        whileHover={{ y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-2 max-w-xs shadow-2xl">
          <p className="text-xs text-slate-200 font-medium">
            ✨ Drag and drop onto a slot to equip
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
