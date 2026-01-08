"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Filter } from "lucide-react";
import { Powerup, PowerupType, PowerupCategory } from "@/lib/powerup-service";
import { listPowerups } from "@/lib/powerup-client";
import PowerupList from "./components/PowerupList";
import PowerupEditor from "./components/PowerupEditor";

export default function AdminPowerupsPage() {
  const [powerups, setPowerups] = useState<Powerup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<PowerupType | "ALL">("ALL");
  const [filterCategory, setFilterCategory] = useState<PowerupCategory | "ALL">("ALL");
  const [showEditor, setShowEditor] = useState(false);
  const [editingPowerup, setEditingPowerup] = useState<Powerup | null>(null);

  useEffect(() => {
    loadPowerups();
  }, [filterType, filterCategory]);

  const loadPowerups = async () => {
    setLoading(true);
    try {
      const filters: any = { is_active: true };
      if (filterType !== "ALL") filters.type = filterType;
      if (filterCategory !== "ALL") filters.category = filterCategory;
      if (searchQuery) filters.search = searchQuery;

      const data = await listPowerups(filters);
      setPowerups(data);
    } catch (error: any) {
      console.error("Failed to load powerups:", error);
      alert("Failed to load powerups: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadPowerups();
  };

  const handleCreate = (type: PowerupType) => {
    setEditingPowerup(null);
    setShowEditor(true);
  };

  const handleEdit = (powerup: Powerup) => {
    setEditingPowerup(powerup);
    setShowEditor(true);
  };

  const handleEditorClose = (saved: boolean) => {
    setShowEditor(false);
    setEditingPowerup(null);
    if (saved) {
      loadPowerups();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this powerup?")) return;

    try {
      const response = await fetch(`/api/powerups/${id}?hard=false`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      loadPowerups();
    } catch (error: any) {
      alert("Failed to delete powerup: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Admin</span>
              </Link>
              <div className="h-6 w-px bg-white/10"></div>
              <h1 className="text-xl font-bold text-white">AI Powerup Management</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Create Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => handleCreate("SKILL")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            New Skill
          </button>
          <button
            onClick={() => handleCreate("PERSONA")}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            New Persona
          </button>
          <button
            onClick={() => handleCreate("KNOWLEDGE")}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            New Knowledge
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search powerups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/20"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
            >
              <option value="ALL">All Types</option>
              <option value="SKILL">Skills</option>
              <option value="PERSONA">Personas</option>
              <option value="KNOWLEDGE">Knowledge</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
            >
              <option value="ALL">All Categories</option>
              <option value="marketing">Marketing</option>
              <option value="development">Development</option>
              <option value="research">Research</option>
              <option value="copywriting">Copywriting</option>
              <option value="analysis">Analysis</option>
              <option value="custom">Custom</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </div>

        {/* Powerup List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <PowerupList
            powerups={powerups}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <PowerupEditor
          powerup={editingPowerup}
          onClose={handleEditorClose}
        />
      )}
    </div>
  );
}
