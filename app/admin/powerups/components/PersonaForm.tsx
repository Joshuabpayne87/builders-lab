"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

interface PersonaContent {
  role: string;
  tone: string;
  expertise: string[];
  system_prompt: string;
}

interface PersonaFormProps {
  content: any;
  onChange: (content: PersonaContent) => void;
}

export default function PersonaForm({ content, onChange }: PersonaFormProps) {
  const [role, setRole] = useState(content.role || "");
  const [tone, setTone] = useState(content.tone || "");
  const [expertise, setExpertise] = useState<string[]>(content.expertise || []);
  const [systemPrompt, setSystemPrompt] = useState(content.system_prompt || "");
  const [expertiseInput, setExpertiseInput] = useState("");

  // Update parent whenever any field changes
  useEffect(() => {
    onChange({
      role,
      tone,
      expertise,
      system_prompt: systemPrompt,
    });
  }, [role, tone, expertise, systemPrompt]);

  const handleAddExpertise = () => {
    if (expertiseInput.trim() && !expertise.includes(expertiseInput.trim())) {
      setExpertise([...expertise, expertiseInput.trim()]);
      setExpertiseInput("");
    }
  };

  const handleRemoveExpertise = (item: string) => {
    setExpertise(expertise.filter((e) => e !== item));
  };

  return (
    <div className="space-y-6">
      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Role <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          The professional role or title this persona represents.
        </p>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g., Senior Marketing Consultant, Expert Software Architect, Professional Copywriter"
          className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/20"
          required
        />
      </div>

      {/* Tone */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Communication Tone <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          How this persona communicates. Describe the style and approach.
        </p>
        <input
          type="text"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="e.g., Professional yet approachable, Technical and precise, Warm and encouraging"
          className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/20"
          required
        />
      </div>

      {/* Expertise Areas */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Areas of Expertise
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Key domains where this persona excels. Add multiple areas.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={expertiseInput}
            onChange={(e) => setExpertiseInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddExpertise();
              }
            }}
            placeholder="e.g., B2B Marketing Strategy"
            className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/20 text-sm"
          />
          <button
            type="button"
            onClick={handleAddExpertise}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {expertise.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {expertise.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600/20 border border-purple-600/50 text-purple-300 rounded-lg text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveExpertise(item)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {expertise.length === 0 && (
          <p className="text-xs text-slate-500 italic">
            No expertise areas added yet. Add 3-5 key areas.
          </p>
        )}
      </div>

      {/* System Prompt */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          System Prompt <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          The actual prompt that will be injected into the AI system message. Define the
          persona's background, experience, approach, and behavior.
        </p>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="You are a [role] with [X] years of experience in [domain].

Your background:
- [Key experience point 1]
- [Key experience point 2]
- [Key experience point 3]

Your approach:
- [Methodology or philosophy]
- [Core principles]
- [Communication style]

When helping users, you:
1. [Behavior 1]
2. [Behavior 2]
3. [Behavior 3]

You always maintain [characteristic] while ensuring [goal]."
          rows={16}
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-white/20 resize-none font-mono text-sm"
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          {systemPrompt.length} characters
        </p>
      </div>

      {/* Preview Section */}
      {(role || tone || expertise.length > 0) && (
        <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-300 mb-2">Persona Preview</h4>
          <div className="space-y-2 text-sm text-slate-300">
            {role && (
              <p>
                <span className="text-slate-500">Role:</span> {role}
              </p>
            )}
            {tone && (
              <p>
                <span className="text-slate-500">Tone:</span> {tone}
              </p>
            )}
            {expertise.length > 0 && (
              <p>
                <span className="text-slate-500">Expertise:</span>{" "}
                {expertise.join(", ")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
