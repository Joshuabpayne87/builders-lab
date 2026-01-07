"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, ChevronDown, ChevronRight, FileText, Image as ImageIcon, Lightbulb, Clock } from 'lucide-react';

interface StorageItem {
  id: string;
  title: string;
  date: number;
  preview?: string;
}

interface AppStorage {
  key: string;
  appName: string;
  icon: React.ReactNode;
  items: StorageItem[];
}

export default function StorageManager() {
  const [apps, setApps] = useState<AppStorage[]>([]);
  const [expandedApps, setExpandedApps] = useState<Record<string, boolean>>({
    'Banana Blitz': true,
    'Unravel': true,
    'InsightLens': true
  });

  useEffect(() => {
    loadStorage();
  }, []);

  const loadStorage = () => {
    const loadedApps: AppStorage[] = [];

    // Banana Blitz
    try {
      const bananaRaw = localStorage.getItem('banana_history');
      if (bananaRaw) {
        const history = JSON.parse(bananaRaw);
        loadedApps.push({
          key: 'banana_history',
          appName: 'Banana Blitz',
          icon: <ImageIcon className="w-4 h-4 text-yellow-400" />,
          items: history.map((h: any) => ({
            id: h.id,
            title: h.postText || 'Untitled Campaign',
            date: h.timestamp,
            preview: h.vibe
          }))
        });
      }
    } catch (e) { console.error(e); }

    // Unravel
    try {
      const unravelRaw = localStorage.getItem('unravl_saved');
      if (unravelRaw) {
        const saved = JSON.parse(unravelRaw);
        loadedApps.push({
          key: 'unravl_saved',
          appName: 'Unravel',
          icon: <FileText className="w-4 h-4 text-red-400" />,
          items: saved.map((s: any) => ({
            id: s.id,
            title: s.title || 'Untitled Article',
            date: s.timestamp,
            preview: s.format
          }))
        });
      }
    } catch (e) { console.error(e); }

    // InsightLens
    try {
      const lensRaw = localStorage.getItem('insight_lens_library');
      if (lensRaw) {
        const library = JSON.parse(lensRaw);
        loadedApps.push({
          key: 'insight_lens_library',
          appName: 'InsightLens',
          icon: <Lightbulb className="w-4 h-4 text-purple-400" />,
          items: library.map((l: any) => ({
            id: l.id,
            title: l.title || 'Untitled Insight',
            date: l.timestamp,
            preview: l.lens
          }))
        });
      }
    } catch (e) { console.error(e); }

    setApps(loadedApps);
  };

  const toggleApp = (appName: string) => {
    setExpandedApps(prev => ({ ...prev, [appName]: !prev[appName] }));
  };

  const deleteItem = (appKey: string, itemId: string) => {
    if (!confirm("Delete this item permanently?")) return;

    try {
      const raw = localStorage.getItem(appKey);
      if (!raw) return;

      const data = JSON.parse(raw);
      // Filter out the item
      const updatedData = data.filter((item: any) => item.id !== itemId);
      
      localStorage.setItem(appKey, JSON.stringify(updatedData));
      
      // Reload UI
      loadStorage();
    } catch (e) {
      console.error("Failed to delete item", e);
    }
  };

  return (
    <div className="space-y-4">
      {apps.length === 0 && (
        <div className="text-center py-8 text-slate-500 bg-white/5 rounded-xl border border-white/5">
          <p>No local data found.</p>
        </div>
      )}

      {apps.map(app => (
        <div key={app.key} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
          <button 
            onClick={() => toggleApp(app.appName)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              {app.icon}
              <span className="font-semibold text-sm">{app.appName}</span>
              <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                {app.items.length} items
              </span>
            </div>
            {expandedApps[app.appName] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          </button>

          {expandedApps[app.appName] && (
            <div className="border-t border-white/10 divide-y divide-white/5">
              {app.items.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 text-center">Empty</div>
              ) : (
                app.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-white/5 group transition-colors">
                    <div className="min-w-0 flex-1 pr-4">
                      <h4 className="text-sm font-medium text-slate-200 truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                        {item.preview && (
                          <span className="text-[10px] text-slate-400 bg-white/5 px-1.5 rounded uppercase tracking-wider">
                            {item.preview}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItem(app.key, item.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
