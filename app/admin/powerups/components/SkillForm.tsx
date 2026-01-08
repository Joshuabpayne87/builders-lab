"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

interface SkillContent {
  instructions: string;
  examples: string[];
  use_cases: string[];
}

interface SkillFormProps {
  content: any;
  onChange: (content: SkillContent) => void;
}

export default function SkillForm({ content, onChange }: SkillFormProps) {
  const [instructions, setInstructions] = useState(content.instructions || "");
  const [examples, setExamples] = useState<string[]>(content.examples || []);
  const [useCases, setUseCases] = useState<string[]>(content.use_cases || []);
  const [exampleInput, setExampleInput] = useState("");
  const [useCaseInput, setUseCaseInput] = useState("");

  // Update parent whenever any field changes
  useEffect(() => {
    onChange({
      instructions,
      examples,
      use_cases: useCases,
    });
  }, [instructions, examples, useCases]);

  const handleAddExample = () => {
    if (exampleInput.trim()) {
      setExamples([...examples, exampleInput.trim()]);
      setExampleInput("");
    }
  };

  const handleRemoveExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleAddUseCase = () => {
    if (useCaseInput.trim()) {
      setUseCases([...useCases, useCaseInput.trim()]);
      setUseCaseInput("");
    }
  };

  const handleRemoveUseCase = (index: number) => {
    setUseCases(useCases.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Instructions <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Detailed instructions on how the AI should use this skill. Be specific about
          techniques, approaches, and best practices.
        </p>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="You are an expert in [domain]. When helping with [task]:

1. Always start by [step]
2. Consider [important factors]
3. Apply [techniques]
4. Focus on [goals]

Example approach:
- [guideline 1]
- [guideline 2]
- [guideline 3]"
          rows={12}
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-white/20 resize-none font-mono text-sm"
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          {instructions.length} characters
        </p>
      </div>

      {/* Examples */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Example Prompts
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Sample prompts that users might use with this skill. These help users understand
          when to use this powerup.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={exampleInput}
            onChange={(e) => setExampleInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddExample();
              }
            }}
            placeholder="e.g., Optimize this blog post for the keyword 'AI tools'"
            className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/20 text-sm"
          />
          <button
            type="button"
            onClick={handleAddExample}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {examples.length > 0 && (
          <div className="space-y-2">
            {examples.map((example, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-white/5 border border-white/10 rounded-lg group"
              >
                <span className="flex-1 text-sm text-slate-300">{example}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveExample(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-600/20 rounded text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {examples.length === 0 && (
          <p className="text-xs text-slate-500 italic">
            No examples added yet. Add at least 2-3 examples to help users.
          </p>
        )}
      </div>

      {/* Use Cases */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Use Cases
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Specific scenarios where this skill is most effective.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={useCaseInput}
            onChange={(e) => setUseCaseInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUseCase();
              }
            }}
            placeholder="e.g., Blog post optimization"
            className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/20 text-sm"
          />
          <button
            type="button"
            onClick={handleAddUseCase}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {useCases.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {useCases.map((useCase, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 border border-blue-600/50 text-blue-300 rounded-lg text-sm"
              >
                {useCase}
                <button
                  type="button"
                  onClick={() => handleRemoveUseCase(index)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {useCases.length === 0 && (
          <p className="text-xs text-slate-500 italic">
            No use cases added yet. Add 2-4 common scenarios.
          </p>
        )}
      </div>
    </div>
  );
}
