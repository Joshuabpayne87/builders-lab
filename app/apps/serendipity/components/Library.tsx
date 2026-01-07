"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Clock, FileText, ChevronRight, X, Copy, Download, Loader2 } from 'lucide-react';
import { listSessions, deleteSession } from '@/lib/session-client';
import type { Session } from '@/lib/session-service';

interface LibraryItem {
  id: string;
  title: string;
  content: string;
  image?: string;
  format: string;
  timestamp: number;
}

export default function Library() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const sessions = await listSessions('serendipity', 50);
      const libraryItems: LibraryItem[] = sessions.map((session: Session) => ({
        id: session.id,
        title: session.data.title || session.title,
        content: session.data.content,
        image: session.data.image,
        format: session.data.format,
        timestamp: session.data.timestamp || new Date(session.created_at).getTime()
      }));
      setItems(libraryItems);
    } catch (error) {
      console.error("Failed to load library:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this item permanently?")) return;

    try {
      await deleteSession(id);
      const updated = items.filter(item => item.id !== id);
      setItems(updated);
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Memory Core</h2>
          <p className="text-slate-400 font-light">Access your archived workflows and creations.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-panel rounded-3xl p-20 text-center flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-violet-400 animate-spin mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">Loading Library</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Retrieving your saved workflows...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel rounded-3xl p-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Library Empty</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Generate content in the Workflow Engine and save it to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative glass-panel rounded-3xl p-6 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] cursor-pointer border border-white/5"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-violet-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-violet-400" />
                </div>
                <button 
                  onClick={(e) => deleteItem(item.id, e)}
                  className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h4 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-violet-300 transition-colors">{item.title}</h4>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(item.timestamp).toLocaleDateString()}</span>
                <span className="bg-white/5 px-2 py-0.5 rounded text-fuchsia-400">{item.format}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" onClick={() => setSelectedItem(null)} />
          <div className="relative w-full max-w-5xl max-h-full glass-panel rounded-[40px] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
            <header className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-black bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded uppercase tracking-widest">{selectedItem.format}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{new Date(selectedItem.timestamp).toLocaleString()}</span>
                </div>
                <h3 className="text-2xl font-bold text-white">{selectedItem.title}</h3>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => copyContent(selectedItem.content)}
                  className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-colors flex items-center gap-2 text-sm font-bold"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-colors flex items-center justify-center font-bold"
                >&times;</button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-8 md:p-12">
              <div className="max-w-3xl mx-auto space-y-10">
                {selectedItem.image && (
                  <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                    <img src={selectedItem.image} alt="Generated visual" className="w-full h-auto" />
                  </div>
                )}
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed text-slate-300 text-lg font-light">
                    {selectedItem.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
