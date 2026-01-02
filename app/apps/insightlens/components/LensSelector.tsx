"use client";

import React from 'react';
import { LensType, LensConfig } from '../types';

interface LensSelectorProps {
  selectedLens: LensType | null;
  onSelect: (lens: LensType) => void;
}

const LENSES: LensConfig[] = [
  {
    id: LensType.SUMMARY,
    title: "Data Compression",
    description: "Synthesize key points.",
    icon: "📝",
    color: "from-blue-600 to-cyan-400"
  },
  {
    id: LensType.MINDMAP,
    title: "Neural Network",
    description: "Visualize connections.",
    icon: "🧠",
    color: "from-purple-600 to-pink-500"
  },
  {
    id: LensType.PODCAST,
    title: "Auditory Cortex",
    description: "Generate dialogue.",
    icon: "🎧",
    color: "from-emerald-500 to-teal-400"
  },
  {
    id: LensType.OUTLINE,
    title: "Logic Structure",
    description: "Hierarchical breakdown.",
    icon: "📑",
    color: "from-orange-500 to-amber-400"
  },
  {
    id: LensType.SCRIPT,
    title: "Narrative Engine",
    description: "Video production flow.",
    icon: "🎬",
    color: "from-red-600 to-rose-400"
  },
  {
    id: LensType.VISUAL,
    title: "Visual Cortex",
    description: "Generate imagery.",
    icon: "👁️",
    color: "from-indigo-600 to-violet-500"
  },
  {
    id: LensType.TRANSLATE,
    title: "Universal Translator",
    description: "Multi-language conversion.",
    icon: "🌐",
    color: "from-pink-500 to-rose-500"
  },
  {
    id: LensType.QUIZ,
    title: "Knowledge Check",
    description: "Generate assessments.",
    icon: "❓",
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: LensType.ELI5,
    title: "Simplifier (ELI5)",
    description: "Explain like I'm 5.",
    icon: "🧸",
    color: "from-green-500 to-lime-500"
  },
  {
    id: LensType.CRITIQUE,
    title: "Critical Eye",
    description: "Analyze bias & logic.",
    icon: "🔍",
    color: "from-slate-500 to-zinc-500"
  },
  {
    id: LensType.SOCIAL,
    title: "Social Amplifier",
    description: "Generate posts.",
    icon: "📣",
    color: "from-blue-500 to-indigo-500"
  }
];

const LensSelector: React.FC<LensSelectorProps> = ({ selectedLens, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl mx-auto">
      {LENSES.map((lens) => (
        <button
          key={lens.id}
          onClick={() => onSelect(lens.id)}
          className={`relative group h-32 rounded-2xl transition-all duration-300 overflow-hidden text-left p-0.5
            ${selectedLens === lens.id ? 'scale-[1.03]' : 'hover:scale-[1.02]'}
          `}
        >
          {/* Active Gradient Border */}
          <div className={`absolute inset-0 bg-gradient-to-br ${lens.color} opacity-0 ${selectedLens === lens.id ? 'opacity-100' : 'group-hover:opacity-70'} transition-opacity duration-300`}></div>
          
          {/* Inner Content */}
          <div className="relative h-full w-full bg-slate-950/90 rounded-[14px] p-5 backdrop-blur-xl flex flex-col justify-between border border-white/5 group-hover:bg-slate-900/90 transition-colors">
             
             {/* Glow Effect */}
             <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${lens.color} blur-[60px] opacity-20 rounded-full pointer-events-none`}></div>

             <div className="flex justify-between items-start">
                <div className={`text-2xl p-2 rounded-lg bg-white/5 border border-white/10 ${selectedLens === lens.id ? 'text-white shadow-lg shadow-white/10' : 'text-slate-400 group-hover:text-white'}`}>
                    {lens.icon}
                </div>
                {selectedLens === lens.id && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]"></div>
                )}
             </div>

             <div>
                <h3 className={`font-bold text-lg tracking-wide ${selectedLens === lens.id ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300' : 'text-slate-300 group-hover:text-white'}`}>
                    {lens.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{lens.description}</p>
             </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default LensSelector;
