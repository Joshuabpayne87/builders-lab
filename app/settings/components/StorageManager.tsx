import React, { useState, useEffect } from 'react';
import { Trash2, ChevronDown, ChevronRight, FileText, Image as ImageIcon, Lightbulb, Clock, Sparkles, Layers, Code, Database, StickyNote, Loader2 } from 'lucide-react';
import { listAllSessions, deleteSession } from '@/lib/session-client';
import type { Session } from '@/lib/session-service';
import { toast } from 'sonner';

interface StorageItem {
  id: string;
  title: string;
  date: number | string;
  preview?: string;
  type?: string;
}

interface AppStorage {
  key: string;
  appName: string;
  icon: React.ReactNode;
  items: StorageItem[];
  source: 'supabase' | 'local';
}

const APP_CONFIG = {
  'banana-blitz': { name: 'Banana Blitz', icon: <ImageIcon className="w-4 h-4 text-yellow-400" /> },
  'unravel': { name: 'Unravel', icon: <FileText className="w-4 h-4 text-red-400" /> },
  'insightlens': { name: 'InsightLens', icon: <Lightbulb className="w-4 h-4 text-purple-400" /> },
  'promptstash': { name: 'PromptStash', icon: <Sparkles className="w-4 h-4 text-blue-400" /> },
  'serendipity': { name: 'Serendipity', icon: <Layers className="w-4 h-4 text-fuchsia-400" /> },
  'component-studio': { name: 'Component Studio', icon: <Code className="w-4 h-4 text-emerald-400" /> },
  'scratchpad': { name: 'Quick Notes', icon: <StickyNote className="w-4 h-4 text-amber-400" /> },
};

export default function StorageManager() {
  const [apps, setApps] = useState<AppStorage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedApps, setExpandedApps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAllStorage();
  }, []);

  const loadAllStorage = async () => {
    setLoading(true);
    const loadedApps: AppStorage[] = [];

    // 1. Fetch Supabase Sessions
    try {
      const supabaseSessions = await listAllSessions(200);
      
      // Group by app
      const grouped = supabaseSessions.reduce((acc, session) => {
        if (!acc[session.app_name]) acc[session.app_name] = [];
        acc[session.app_name].push({
          id: session.id,
          title: session.title,
          date: session.created_at,
          type: session.session_type,
          preview: session.session_type.replace('_', ' ')
        });
        return acc;
      }, {} as Record<string, StorageItem[]>);

      Object.entries(grouped).forEach(([appName, items]) => {
        const config = APP_CONFIG[appName as keyof typeof APP_CONFIG] || { name: appName, icon: <Database className="w-4 h-4" /> };
        loadedApps.push({
          key: appName,
          appName: config.name,
          icon: config.icon,
          items,
          source: 'supabase'
        });
      });
    } catch (e) {
      console.error("Failed to load supabase sessions", e);
    }

    // 2. Fetch Legacy Local Storage (for cleanup)
    const localKeys = [
      { key: 'banana_history', app: 'Banana Blitz', icon: <ImageIcon className="w-4 h-4 text-yellow-400/50" /> },
      { key: 'unravl_saved', app: 'Unravel', icon: <FileText className="w-4 h-4 text-red-400/50" /> },
      { key: 'insight_lens_library', app: 'InsightLens', icon: <Lightbulb className="w-4 h-4 text-purple-400/50" /> },
      { key: 'dashboard_scratchpad', app: 'Quick Notes (Local)', icon: <StickyNote className="w-4 h-4 text-amber-400/50" /> },
    ];

    localKeys.forEach(lk => {
      try {
        const raw = localStorage.getItem(lk.key);
        if (raw) {
          let items: StorageItem[] = [];
          if (lk.key === 'dashboard_scratchpad') {
            items = [{ id: 'local_note', title: 'Current Scratchpad Note', date: Date.now() }];
          } else {
            const parsed = JSON.parse(raw);
            items = parsed.map((item: any) => ({
              id: item.id || Math.random().toString(),
              title: item.title || item.postText || 'Legacy Item',
              date: item.timestamp || Date.now()
            }));
          }

          if (items.length > 0) {
            loadedApps.push({
              key: lk.key,
              appName: `${lk.app} (Legacy)`,
              icon: lk.icon,
              items,
              source: 'local'
            });
          }
        }
      } catch (e) { /* ignore */ }
    });

    setApps(loadedApps);
    setLoading(false);
  };

  const toggleApp = (appName: string) => {
    setExpandedApps(prev => ({ ...prev, [appName]: !prev[appName] }));
  };

  const handleDeleteItem = async (app: AppStorage, itemId: string) => {
    if (!confirm("Delete this item permanently?")) return;

    try {
      if (app.source === 'supabase') {
        await deleteSession(itemId);
        toast.success("Item deleted from cloud");
      } else {
        if (app.key === 'dashboard_scratchpad') {
          localStorage.removeItem(app.key);
        } else {
          const raw = localStorage.getItem(app.key);
          if (raw) {
            const data = JSON.parse(raw);
            const updated = data.filter((i: any) => i.id !== itemId);
            localStorage.setItem(app.key, JSON.stringify(updated));
          }
        }
        toast.success("Legacy item removed");
      }
      loadAllStorage();
    } catch (e) {
      toast.error("Failed to delete item");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-white/30 mb-2" />
        <p className="text-xs text-slate-500">Scanning Storage...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Connected Storage Hub</p>
        <button onClick={loadAllStorage} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase">Refresh</button>
      </div>

      {apps.length === 0 && (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed">
          <Database className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No storage data detected.</p>
        </div>
      )}

      {apps.map(app => (
        <div key={app.key} className={`border rounded-xl overflow-hidden bg-white/5 transition-all ${app.source === 'local' ? 'border-amber-500/20' : 'border-white/10'}`}>
          <button 
            onClick={() => toggleApp(app.appName)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              {app.icon}
              <div className="flex flex-col items-start">
                <span className="font-bold text-sm text-white">{app.appName}</span>
                <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">
                  {app.source === 'supabase' ? 'Cloud Sync Active' : 'Legacy Local Data'}
                </span>
              </div>
              <span className="text-[10px] font-bold bg-black/40 text-slate-400 px-2 py-0.5 rounded-full border border-white/5">
                {app.items.length}
              </span>
            </div>
            {expandedApps[app.appName] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          </button>

          {expandedApps[app.appName] && (
            <div className="border-t border-white/10 divide-y divide-white/5 bg-black/20">
              {app.items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 hover:bg-white/5 group transition-colors">
                  <div className="min-w-0 flex-1 pr-4">
                    <h4 className="text-sm font-medium text-slate-200 truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      {item.preview && (
                        <span className="text-[10px] font-black text-slate-400 bg-white/5 px-1.5 rounded uppercase tracking-wider">
                          {item.preview}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(app, item.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
