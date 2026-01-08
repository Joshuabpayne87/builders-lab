"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Powerup, PowerupType, PowerupCategory } from "@/lib/powerup-service";
import { createPowerup, updatePowerup } from "@/lib/powerup-client";
import SkillForm from "./SkillForm";
import PersonaForm from "./PersonaForm";
import KnowledgeUpload from "./KnowledgeUpload";

interface PowerupEditorProps {
  powerup: Powerup | null;
  onClose: (saved: boolean) => void;
}

export default function PowerupEditor({ powerup, onClose }: PowerupEditorProps) {
  const isEditMode = !!powerup;
  const [powerupType, setPowerupType] = useState<PowerupType>(
    powerup?.powerup_type || "SKILL"
  );
  const [name, setName] = useState(powerup?.name || "");
  const [description, setDescription] = useState(powerup?.description || "");
  const [icon, setIcon] = useState(powerup?.icon || "");
  const [category, setCategory] = useState<PowerupCategory>(
    (powerup?.category as PowerupCategory) || "custom"
  );
  const [tags, setTags] = useState<string[]>(powerup?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState<any>(powerup?.content || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when powerup changes
  useEffect(() => {
    if (powerup) {
      setPowerupType(powerup.powerup_type);
      setName(powerup.name);
      setDescription(powerup.description || "");
      setIcon(powerup.icon || "");
      setCategory((powerup.category as PowerupCategory) || "custom");
      setTags(powerup.tags || []);
      setContent(powerup.content || {});
    }
  }, [powerup]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!content || Object.keys(content).length === 0) {
      setError("Content is required. Please fill out the form below.");
      return;
    }

    setSaving(true);

    try {
      const powerupData = {
        powerup_type: powerupType,
        name: name.trim(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        category: category || undefined,
        content,
        tags,
      };

      if (isEditMode) {
        await updatePowerup(powerup.id, powerupData);
      } else {
        await createPowerup(powerupData);
      }

      onClose(true);
    } catch (err: any) {
      setError(err.message || "Failed to save powerup");
      setSaving(false);
    }
  };

  const renderTypeSpecificForm = () => {
    switch (powerupType) {
      case "SKILL":
        return <SkillForm content={content} onChange={setContent} />;
      case "PERSONA":
        return <PersonaForm content={content} onChange={setContent} />;
      case "KNOWLEDGE":
        return <KnowledgeUpload content={content} onChange={setContent} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {isEditMode ? "Edit Powerup" : "Create New Powerup"}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={saving}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Type Selection (only for create mode) */}
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Powerup Type
                </label>
                <div className="flex gap-3">
                  {(["SKILL", "PERSONA", "KNOWLEDGE"] as PowerupType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setPowerupType(type);
                        setContent({});
                      }}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                        powerupType === type
                          ? type === "SKILL"
                            ? "bg-blue-600/20 border-blue-600 text-blue-400"
                            : type === "PERSONA"
                            ? "bg-purple-600/20 border-purple-600 text-purple-400"
                            : "bg-pink-600/20 border-pink-600 text-pink-400"
                          : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., SEO Optimization Expert"
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/20"
                  required
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="🔍"
                  maxLength={4}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/20"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PowerupCategory)}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
                >
                  <option value="marketing">Marketing</option>
                  <option value="development">Development</option>
                  <option value="research">Research</option>
                  <option value="copywriting">Copywriting</option>
                  <option value="analysis">Analysis</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of what this powerup does..."
                  rows={3}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/20 resize-none"
                />
              </div>

              {/* Tags */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-slate-300 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10"></div>

            {/* Type-Specific Form */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {powerupType === "SKILL"
                  ? "Skill Configuration"
                  : powerupType === "PERSONA"
                  ? "Persona Configuration"
                  : "Knowledge Configuration"}
              </h3>
              {renderTypeSpecificForm()}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-black/40">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors font-medium"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : isEditMode ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
