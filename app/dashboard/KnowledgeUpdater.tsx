"use client";

import { useState, useEffect } from "react";
import { Brain, ChevronDown, X, Zap, Search } from "lucide-react";
import { getDefaultLoadout, updateLoadout } from "@/lib/loadout-client";
import { listPowerups, getManyPowerups } from "@/lib/powerup-client";
import type { Loadout, SlotConfig } from "@/lib/loadout-service";
import type { Powerup } from "@/lib/powerup-service";

const SLOT_CONFIG = [
  { id: 'marketing' as const, label: 'Marketing' },
  { id: 'copywriter' as const, label: 'Copywriter' },
  { id: 'researcher' as const, label: 'Researcher' },
  { id: 'developer' as const, label: 'Developer' },
  { id: 'analyst' as const, label: 'Analyst' },
  { id: 'custom' as const, label: 'Custom' },
];

export function KnowledgeUpdater() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadout, setLoadout] = useState<Loadout | null>(null);
  const [allPowerups, setAllPowerups] = useState<Powerup[]>([]);
  const [equippedPowerups, setEquippedPowerups] = useState<Powerup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const defaultLoadout = await getDefaultLoadout();
        setLoadout(defaultLoadout);

        const powerups = await listPowerups();
        setAllPowerups(powerups);

        // Load equipped powerups
        if (defaultLoadout?.equipped_powerups.length) {
          const equipped = await getManyPowerups(defaultLoadout.equipped_powerups);
          setEquippedPowerups(equipped);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDragStart = (e: React.DragEvent, powerup: Powerup) => {
    e.dataTransfer.setData("powerup", JSON.stringify(powerup));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDropOnSlot = async (e: React.DragEvent, slotId: keyof SlotConfig) => {
    e.preventDefault();
    if (!loadout) return;

    try {
      const powerupData = e.dataTransfer.getData("powerup");
      if (powerupData) {
        const droppedPowerup = JSON.parse(powerupData) as Powerup;

        // Update loadout
        const newEquipped = loadout.equipped_powerups.includes(droppedPowerup.id)
          ? loadout.equipped_powerups
          : [...loadout.equipped_powerups, droppedPowerup.id];

        const updatedLoadout = {
          ...loadout,
          slot_config: {
            ...loadout.slot_config,
            [slotId]: droppedPowerup.id,
          },
          equipped_powerups: newEquipped,
        };

        await updateLoadout(loadout.id, {
          slot_config: updatedLoadout.slot_config,
          equipped_powerups: newEquipped,
        });

        setLoadout(updatedLoadout);
        if (!equippedPowerups.find(p => p.id === droppedPowerup.id)) {
          setEquippedPowerups([...equippedPowerups, droppedPowerup]);
        }
      }
    } catch (error) {
      console.error("Failed to equip powerup:", error);
    }
  };

  const handleRemoveFromSlot = async (slotId: keyof SlotConfig) => {
    if (!loadout) return;

    try {
      const updatedSlotConfig = {
        ...loadout.slot_config,
        [slotId]: null,
      };

      await updateLoadout(loadout.id, {
        slot_config: updatedSlotConfig,
      });

      const updatedLoadout = {
        ...loadout,
        slot_config: updatedSlotConfig,
      };

      setLoadout(updatedLoadout);

      // Reload equipped powerups
      if (updatedLoadout.equipped_powerups.length > 0) {
        const equipped = await getManyPowerups(updatedLoadout.equipped_powerups);
        setEquippedPowerups(equipped);
      }
    } catch (error) {
      console.error("Failed to unequip powerup:", error);
    }
  };

  const getEquippedPowerup = (slotId: keyof SlotConfig): Powerup | undefined => {
    const powerupId = loadout?.slot_config?.[slotId];
    if (typeof powerupId === 'string') {
      return equippedPowerups.find(p => p.id === powerupId);
    }
    return undefined;
  };

  const availablePowerups = allPowerups.filter(p =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const equippedCount = loadout?.equipped_powerups?.length || 0;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-red-600/20 to-pink-600/20 backdrop-blur-sm border border-red-500/20 rounded-xl p-5 h-40 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3"></div>
      </div>
    );
  }

  if (isExpanded) {
    return (
      <div className="bg-gradient-to-br from-red-600/10 to-pink-600/10 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={() => setIsExpanded(false)}
          className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Brain className="w-5 h-5 text-red-400" />
          <h2 className="text-base font-semibold text-white">The Brain</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slots Grid */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Skill Slots
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SLOT_CONFIG.map(slot => {
                const equipped = getEquippedPowerup(slot.id);
                return (
                  <div
                    key={slot.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnSlot(e, slot.id)}
                    className="relative bg-black/30 border-2 border-dashed border-red-500/30 hover:border-red-500/60 rounded-lg p-4 min-h-28 flex flex-col items-center justify-center transition-colors group cursor-pointer"
                  >
                    {equipped ? (
                      <div className="text-center w-full">
                        <div className="text-4xl mb-2">{equipped.icon || '⚡'}</div>
                        <p className="text-xs font-medium text-white line-clamp-2">{equipped.name}</p>
                        <button
                          onClick={() => handleRemoveFromSlot(slot.id)}
                          className="mt-2 p-1 hover:bg-red-600/50 rounded transition-colors"
                        >
                          <X className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500">
                        <Zap className="w-5 h-5 mb-2 mx-auto opacity-50" />
                        <div className="text-xs font-medium">{slot.label}</div>
                        <div className="text-[10px] text-slate-600 mt-1">drag here</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available Skills */}
          <div className="lg:col-span-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Available Skills ({availablePowerups.length})
            </h3>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
              />
            </div>

            {/* Skills List */}
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
              {availablePowerups.slice(0, 20).map(powerup => (
                <div
                  key={powerup.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, powerup)}
                  className="p-3 bg-black/40 border border-red-500/20 rounded-lg hover:border-red-500/50 hover:bg-black/60 transition-all cursor-move group"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">{powerup.icon || '⚡'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{powerup.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize truncate">
                        {powerup.powerup_type.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Collapsed state
  return (
    <div className="bg-gradient-to-br from-red-600/40 to-pink-600/40 backdrop-blur-sm border border-red-500/40 rounded-xl p-5 h-40 flex flex-col relative overflow-hidden group hover:border-red-500/60 transition-all cursor-pointer"
      onClick={() => setIsExpanded(true)}
    >
      {/* Pulsing glow effect */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">The Brain</h3>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-red-400 mb-1">{equippedCount}</p>
          <p className="text-xs text-slate-300">Skills Equipped</p>
          <p className="text-[10px] text-slate-500 mt-2">Click to manage</p>
        </div>

        <div className="flex items-center justify-center gap-1 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Open</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
