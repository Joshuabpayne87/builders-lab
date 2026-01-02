"use client";

import React, { useEffect, useState } from 'react';
import { LibraryItem, LensType } from '../types';
import { getLibraryItems, deleteLibraryItem, groupItemsByCategory, clearLibrary } from '../services/storage';

interface LibraryProps {
  onLoadItem: (item: LibraryItem) => void;
  onBack: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  [LensType.SUMMARY]: "Data Compressions",
  [LensType.MINDMAP]: "Neural Networks",
  [LensType.PODCAST]: "Auditory Logs",
  [LensType.OUTLINE]: "Logic Structures",
  [LensType.SCRIPT]: "Narrative Sequences",
  [LensType.VISUAL]: "Visual Constructs"
};

const Library: React.FC<LibraryProps> = ({ onLoadItem, onBack }) => {
  const [items, setItems] = useState<LibraryItem[]>([]);

  useEffect(() => {
    setItems(getLibraryItems());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Purge this engram from memory core?")) {
      setItems(deleteLibraryItem(id));
    }
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    if (window.confirm("WARNING: Complete Memory Core Wipe initiated. Proceed?")) {
      clearLibrary();
      setItems([]);
    }
  };

  const groupedItems = groupItemsByCategory(items);
  const categories = Object.keys(groupedItems) as LensType[];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fadeIn relative">
        <div className="absolute inset-0 bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="w-32 h-32 rounded-full border border-indigo-500/30 flex items-center justify-center mb-8 relative">
           <div className="absolute inset-0 rounded-full border border-indigo-500/10 animate-ping"></div>
           <span className="text-5xl opacity-50">💠</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Memory Core Empty</h2>
        <p className="text-indigo-300/60 mb-8 max-w-md tech-mono text-sm">
          NO SAVED ENGRAMS DETECTED. <br/> INITIATE TRANSFORMATION SEQUENCE.
        </p>
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full transition-all border border-indigo-500/50 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
        >
          Initialize New Sequence
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-20 animate-slideUp">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6 glass-panel p-6 rounded-2xl border-l-4 border-indigo-500">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-wide">Memory Core</h2>
           <p className="text-xs text-indigo-400 tech-mono mt-1">CAPACITY: UNLIMITED // ENCRYPTION: ACTIVE</p>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={handleClearAll}
                className="px-4 py-2 text-xs font-bold text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors tech-mono tracking-wider"
            >
                PURGE_ALL
            </button>
            <button onClick={onBack} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-bold shadow-lg shadow-indigo-500/30">
                ← Return to Cortex
            </button>
        </div>
      </div>

      <div className="space-y-16">
        {categories.map((category) => (
          <div key={category} className="animate-fadeIn relative">
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-6">
               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
               <h3 className="text-xl font-bold text-cyan-300 tech-mono uppercase tracking-widest flex items-center gap-2">
                 {category === LensType.PODCAST ? '🎧' : category === LensType.VISUAL ? '👁️' : '💠'}
                 {CATEGORY_LABELS[category]}
               </h3>
               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedItems[category].map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onLoadItem(item)}
                  className="group relative bg-slate-900/40 backdrop-blur-sm border border-white/10 hover:border-cyan-500/50 rounded-xl p-0.5 transition-all cursor-pointer overflow-hidden hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                >
                  {/* Hover Gradient BG */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative bg-slate-950/80 rounded-[10px] p-6 h-full flex flex-col">
                     <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button 
                          onClick={(e) => handleDelete(e, item.id)}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                          title="Purge Engram"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                     </div>

                    <div className="mb-4">
                        <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded tech-mono">
                            {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-200 group-hover:text-white line-clamp-2 mb-4 leading-relaxed">
                        {item.title}
                    </h4>

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="text-xs text-slate-500 group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                        STORED_LOCALLY
                      </div>
                      <span className="text-xs font-bold text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">ACCESS →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
