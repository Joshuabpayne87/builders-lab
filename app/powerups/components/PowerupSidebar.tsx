"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Powerup, PowerupType } from "@/lib/powerup-service";
import PowerupCard from "./PowerupCard";
import SkillUploader from "./SkillUploader";
import { createClient } from "@/lib/supabase/client";

interface PowerupSidebarProps {
  powerups: Powerup[];
  loading: boolean;
  isOpen: boolean;
  onToggle: () => void;
  equippedPowerups: string[];
  onRefresh: () => void;
}

export default function PowerupSidebar({
  powerups,
  loading,
  isOpen,
  onToggle,
  equippedPowerups,
  onRefresh
}: PowerupSidebarProps) {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    getUser();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<PowerupType | "ALL">("ALL");

  // Filter powerups
  const filteredPowerups = powerups.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "ALL" || p.powerup_type === filterType;
    return matchesSearch && matchesType;
  });

  // Group by type
  const groupedPowerups = {
    SKILL: filteredPowerups.filter(p => p.powerup_type === "SKILL"),
    PERSONA: filteredPowerups.filter(p => p.powerup_type === "PERSONA"),
    KNOWLEDGE: filteredPowerups.filter(p => p.powerup_type === "KNOWLEDGE"),
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          bg-black/40 backdrop-blur-xl border-r border-white/10 transition-all duration-300
          ${isOpen ? 'w-full sm:w-80' : 'w-0'}
          overflow-hidden
        `}
      >
        <div className="h-full flex flex-col">
          {/* Search & Filter */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search powerups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/20 text-sm"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {(["ALL", "SKILL", "PERSONA", "KNOWLEDGE"] as (PowerupType | "ALL")[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
                    ${filterType === type
                      ? type === "SKILL"
                        ? "bg-blue-600 text-white"
                        : type === "PERSONA"
                        ? "bg-purple-600 text-white"
                        : type === "KNOWLEDGE"
                        ? "bg-pink-600 text-white"
                        : "bg-white/20 text-white"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }
                  `}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Uploader */}
          <SkillUploader onUploadComplete={onRefresh} />

          {/* Powerup List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
              </div>
            ) : filteredPowerups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm">No powerups found</p>
              </div>
            ) : (
              <>
                {/* SKILL Powerups */}
                {groupedPowerups.SKILL.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wider">
                      Skills ({groupedPowerups.SKILL.length})
                    </h3>
                    <div className="space-y-2">
                      {groupedPowerups.SKILL.map((powerup) => (
                        <PowerupCard
                          key={powerup.id}
                          powerup={powerup}
                          isEquipped={equippedPowerups.includes(powerup.id)}
                          currentUserId={currentUserId}
                          onDelete={onRefresh}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* PERSONA Powerups */}
                {groupedPowerups.PERSONA.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wider">
                      Personas ({groupedPowerups.PERSONA.length})
                    </h3>
                    <div className="space-y-2">
                      {groupedPowerups.PERSONA.map((powerup) => (
                        <PowerupCard
                          key={powerup.id}
                          powerup={powerup}
                          isEquipped={equippedPowerups.includes(powerup.id)}
                          currentUserId={currentUserId}
                          onDelete={onRefresh}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* KNOWLEDGE Powerups */}
                {groupedPowerups.KNOWLEDGE.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-pink-400 mb-2 uppercase tracking-wider">
                      Knowledge ({groupedPowerups.KNOWLEDGE.length})
                    </h3>
                    <div className="space-y-2">
                      {groupedPowerups.KNOWLEDGE.map((powerup) => (
                        <PowerupCard
                          key={powerup.id}
                          powerup={powerup}
                          isEquipped={equippedPowerups.includes(powerup.id)}
                          currentUserId={currentUserId}
                          onDelete={onRefresh}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-50 bg-black/60 backdrop-blur-xl border border-white/10 rounded-r-lg p-2 hover:bg-white/10 transition-colors"
        style={{ left: isOpen ? '320px' : '0' }}
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>
    </>
  );
}
