"use client";

import { useState, useEffect } from "react";
import { Brain, Zap, ArrowRight, Sparkles, FileText } from "lucide-react";
import Link from "next/link";
import { getDefaultLoadout } from "@/lib/loadout-client";
import { getManyPowerups } from "@/lib/powerup-client";
import type { Loadout } from "@/lib/loadout-service";
import type { Powerup } from "@/lib/powerup-service";

export function BrainCard() {
  const [loadout, setLoadout] = useState<Loadout | null>(null);
  const [powerups, setPowerups] = useState<Powerup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const defaultLoadout = await getDefaultLoadout();
        setLoadout(defaultLoadout);

        // Load equipped powerup details
        if (defaultLoadout && defaultLoadout.equipped_powerups.length > 0) {
          const powerupDetails = await getManyPowerups(defaultLoadout.equipped_powerups);
          setPowerups(powerupDetails);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 h-full animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-white/5 rounded"></div>
          <div className="h-10 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  const equippedCount = loadout?.equipped_powerups?.length || 0;
  const slotConfig = loadout?.slot_config || {};
  const filledSlots = Object.values(slotConfig).filter(Boolean).length;

  return (
    <div className="bg-gradient-to-br from-pink-600/10 to-purple-600/10 backdrop-blur-sm border border-pink-500/20 rounded-xl p-5 h-full flex flex-col relative overflow-hidden group hover:border-pink-500/40 transition-all">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-cyan-500/5"></div>
      </div>

      {/* Pulsing glow effect */}
      {equippedCount > 0 && (
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">AI Brain</h3>
          </div>
          <Link href="/powerups" className="text-[10px] text-slate-500 hover:text-white transition-colors">
            Configure
          </Link>
        </div>

        <div className="flex-1 space-y-3">
          {equippedCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 py-4">
              <Brain className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs text-center">No powerups equipped</p>
              <Link href="/powerups" className="mt-2 text-[10px] font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Add Powerups
              </Link>
            </div>
          ) : (
            <>
              {/* Stats Display */}
              <div className="bg-black/30 rounded-lg p-3 border border-pink-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Active Powerups</span>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span className="text-lg font-bold text-white">{equippedCount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Slots Filled</span>
                  <span className="text-sm font-semibold text-pink-400">{filledSlots}/7</span>
                </div>
              </div>

              {/* Equipped Powerups List */}
              {powerups.length > 0 && (
                <div className="bg-black/20 rounded-lg p-2 border border-pink-500/10 max-h-32 overflow-y-auto scrollbar-thin">
                  <div className="space-y-1">
                    {powerups.map((powerup) => (
                      <div
                        key={powerup.id}
                        className="flex items-center gap-2 bg-black/40 rounded-md px-2 py-1.5 hover:bg-black/60 transition-colors"
                      >
                        <span className="text-base flex-shrink-0">{powerup.icon || '⚡'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{powerup.name}</p>
                          <p className="text-[10px] text-slate-500 truncate capitalize">{powerup.powerup_type.toLowerCase()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Action */}
              <Link
                href="/powerups"
                className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-lg border border-pink-500/30 hover:border-pink-500/50 transition-all group/btn"
              >
                <span className="text-xs font-medium text-white">Manage Brain</span>
                <ArrowRight className="w-3 h-3 text-pink-400 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
