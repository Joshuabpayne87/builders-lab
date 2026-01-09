"use client";

import { Powerup } from "@/lib/powerup-service";
import { SlotConfig } from "@/lib/loadout-service";
import PowerupSlot from "./PowerupSlot";
import BrainNode from "./BrainNode";
import NeuralConnection from "./NeuralConnection";

interface BrainCanvasProps {
  powerups: Powerup[];
  slotConfig: SlotConfig;
  onEquip: (powerupId: string, slot: keyof SlotConfig) => void;
  onUnequip: (slot: keyof SlotConfig, powerupId?: string) => void;
}

// Slot positions in a hexagonal layout
const SLOTS = [
  { id: 'marketing' as keyof SlotConfig, label: 'Marketing', angle: 0, radius: 280 },
  { id: 'copywriter' as keyof SlotConfig, label: 'Copywriter', angle: 60, radius: 280 },
  { id: 'researcher' as keyof SlotConfig, label: 'Researcher', angle: 120, radius: 280 },
  { id: 'developer' as keyof SlotConfig, label: 'Developer', angle: 180, radius: 280 },
  { id: 'analyst' as keyof SlotConfig, label: 'Analyst', angle: 240, radius: 280 },
  { id: 'custom' as keyof SlotConfig, label: 'Custom', angle: 300, radius: 280 },
];

export default function BrainCanvas({
  powerups,
  slotConfig,
  onEquip,
  onUnequip
}: BrainCanvasProps) {
  // Calculate slot positions
  const getSlotPosition = (angle: number, radius: number) => {
    const rad = (angle - 90) * (Math.PI / 180); // -90 to start at top
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    };
  };

  // Get powerup by ID
  const getPowerup = (id: string) => powerups.find(p => p.id === id);

  // Get equipped powerup for a slot
  const getEquippedPowerup = (slotId: keyof SlotConfig) => {
    const powerupId = slotConfig[slotId];
    if (typeof powerupId === 'string') {
      return getPowerup(powerupId);
    }
    return null;
  };

  // Get brain powerups (knowledge files)
  const getBrainPowerups = () => {
    const brainIds = slotConfig.brain as string[] | undefined;
    if (!brainIds || !Array.isArray(brainIds)) return [];
    return brainIds.map(id => getPowerup(id)).filter(Boolean) as Powerup[];
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* SVG for neural connections */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <defs>
          {/* Gradient for connections */}
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f3ff" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#bd00ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff0055" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Draw connections from equipped slots to brain */}
        {SLOTS.map(slot => {
          const equipped = getEquippedPowerup(slot.id);
          if (!equipped) return null;

          const pos = getSlotPosition(slot.angle, slot.radius);
          const canvasWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
          const canvasHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
          const centerX = canvasWidth / 2;
          const centerY = canvasHeight / 2;

          return (
            <NeuralConnection
              key={slot.id}
              fromX={centerX + pos.x}
              fromY={centerY + pos.y}
              toX={centerX}
              toY={centerY}
            />
          );
        })}
      </svg>

      {/* Container for slots and brain */}
      <div className="relative" style={{ width: '700px', height: '700px' }}>
        {/* Regular Slots (Hexagonal layout) */}
        {SLOTS.map(slot => {
          const pos = getSlotPosition(slot.angle, slot.radius);
          const equipped = getEquippedPowerup(slot.id);

          return (
            <div
              key={slot.id}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
              }}
            >
              <PowerupSlot
                slotId={slot.id}
                label={slot.label}
                powerup={equipped || null}
                onEquip={(powerupId) => onEquip(powerupId, slot.id)}
                onUnequip={() => onUnequip(slot.id)}
              />
            </div>
          );
        })}

        {/* Brain Node (Center) */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <BrainNode
            powerups={getBrainPowerups()}
            onEquip={(powerupId) => onEquip(powerupId, 'brain')}
            onUnequip={(powerupId) => onUnequip('brain', powerupId)}
          />
        </div>
      </div>
    </div>
  );
}
