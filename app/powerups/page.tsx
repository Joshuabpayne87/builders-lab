"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, RotateCcw, ChevronDown } from "lucide-react";
import BrainCanvas from "./components/BrainCanvas";
import PowerupSidebar from "./components/PowerupSidebar";
import LoadoutControls from "./components/LoadoutControls";
import { Powerup } from "@/lib/powerup-service";
import { listPowerups } from "@/lib/powerup-client";
import { SlotConfig } from "@/lib/loadout-service";
import { getDefaultLoadout, updateLoadout, createLoadout } from "@/lib/loadout-client";

export default function PowerupsPage() {
  const [powerups, setPowerups] = useState<Powerup[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Slot configuration state
  const [slotConfig, setSlotConfig] = useState<SlotConfig>({});
  const [equippedPowerups, setEquippedPowerups] = useState<string[]>([]);
  const [loadoutId, setLoadoutId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load powerups and default loadout on mount
  useEffect(() => {
    loadPowerups();
    loadDefaultLoadout();
  }, []);

  const loadPowerups = async () => {
    setLoading(true);
    try {
      const data = await listPowerups({ is_active: true });
      setPowerups(data);
    } catch (error: any) {
      console.error("Failed to load powerups:", error);
      alert("Failed to load powerups: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultLoadout = async () => {
    try {
      const loadout = await getDefaultLoadout();
      if (loadout) {
        setLoadoutId(loadout.id);
        setSlotConfig(loadout.slot_config || {});
        setEquippedPowerups(loadout.equipped_powerups || []);
      }
    } catch (error: any) {
      console.error("Failed to load default loadout:", error);
    }
  };

  const handleEquipPowerup = (powerupId: string, slot: keyof SlotConfig) => {
    const newConfig = { ...slotConfig };

    if (slot === 'brain') {
      // Brain slot can have multiple powerups
      const brainSlot = (newConfig.brain || []) as string[];
      if (!brainSlot.includes(powerupId)) {
        newConfig.brain = [...brainSlot, powerupId];
      }
    } else {
      // Other slots have single powerup
      newConfig[slot] = powerupId;
    }

    setSlotConfig(newConfig);

    // Update equipped list
    const allEquipped = new Set<string>();
    Object.values(newConfig).forEach(val => {
      if (Array.isArray(val)) {
        val.forEach(id => allEquipped.add(id));
      } else if (val) {
        allEquipped.add(val as string);
      }
    });
    setEquippedPowerups(Array.from(allEquipped));
  };

  const handleUnequipPowerup = (slot: keyof SlotConfig, powerupId?: string) => {
    const newConfig = { ...slotConfig };

    if (slot === 'brain' && powerupId) {
      // Remove specific powerup from brain
      const brainSlot = (newConfig.brain || []) as string[];
      newConfig.brain = brainSlot.filter(id => id !== powerupId);
    } else {
      // Clear slot
      delete newConfig[slot];
    }

    setSlotConfig(newConfig);

    // Update equipped list
    const allEquipped = new Set<string>();
    Object.values(newConfig).forEach(val => {
      if (Array.isArray(val)) {
        val.forEach(id => allEquipped.add(id));
      } else if (val) {
        allEquipped.add(val as string);
      }
    });
    setEquippedPowerups(Array.from(allEquipped));
  };

  const handleReset = async () => {
    if (confirm("Reset all equipped powerups? This will clear your current configuration.")) {
      setSlotConfig({});
      setEquippedPowerups([]);

      // Save the empty state if we have a loadout ID
      if (loadoutId) {
        try {
          await updateLoadout(loadoutId, {
            slot_config: {},
            equipped_powerups: []
          });
        } catch (error: any) {
          console.error("Failed to save reset:", error);
        }
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (loadoutId) {
        // Update existing loadout
        await updateLoadout(loadoutId, {
          slot_config: slotConfig,
          equipped_powerups: equippedPowerups
        });
      } else {
        // Create new default loadout
        const newLoadout = await createLoadout({
          name: 'Default Loadout',
          is_default: true,
          slot_config: slotConfig,
          equipped_powerups: equippedPowerups
        });
        setLoadoutId(newLoadout.id);
      }

      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      successDiv.textContent = '✓ Loadout saved successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    } catch (error: any) {
      console.error("Failed to save loadout:", error);
      alert("Failed to save loadout: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-slate-200 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"></div>

        {/* Neural Grid Overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(0, 243, 255, 0.1) 25%, rgba(0, 243, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 243, 255, 0.1) 75%, rgba(0, 243, 255, 0.1) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(0, 243, 255, 0.1) 25%, rgba(0, 243, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 243, 255, 0.1) 75%, rgba(0, 243, 255, 0.1) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/assistant"
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back to Assistant</span>
                </Link>
                <div className="h-6 w-px bg-white/10"></div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI Brain Canvas
                </h1>
              </div>

              {/* Controls */}
              <LoadoutControls
                onSave={handleSave}
                onReset={handleReset}
                hasChanges={Object.keys(slotConfig).length > 0}
                saving={saving}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-73px)]">
          {/* Sidebar */}
          <PowerupSidebar
            powerups={powerups}
            loading={loading}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            equippedPowerups={equippedPowerups}
            onRefresh={loadPowerups}
          />

          {/* Brain Canvas */}
          <div className="flex-1 flex items-center justify-center p-8">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                <p className="text-slate-400">Loading powerups...</p>
              </div>
            ) : (
              <BrainCanvas
                powerups={powerups}
                slotConfig={slotConfig}
                onEquip={handleEquipPowerup}
                onUnequip={handleUnequipPowerup}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
