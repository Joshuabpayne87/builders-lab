"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Play, FileText, Image as ImageIcon, Sparkles, Layers, Lightbulb, Code } from "lucide-react";
import { listAllSessions } from "@/lib/session-client";
import type { Session } from "@/lib/session-service";

const APP_ICONS = {
  "banana-blitz": ImageIcon,
  "unravel": FileText,
  "insightlens": Lightbulb,
  "promptstash": Sparkles,
  "component-studio": Code,
  "serendipity": Layers,
};

const APP_LABELS = {
  "banana-blitz": "Banana Blitz",
  "unravel": "Unravel",
  "insightlens": "InsightLens",
  "promptstash": "PromptStash",
  "component-studio": "Component Studio",
  "serendipity": "Serendipity",
};

export function RecentWorkflows() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await listAllSessions(3);
        setSessions(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 h-full animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-white/5 rounded"></div>
          <div className="h-10 bg-white/5 rounded"></div>
          <div className="h-10 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Recent Workflows</h3>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {sessions.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-4">No recent activity</div>
        ) : (
          sessions.map((session) => {
            const Icon = APP_ICONS[session.app_name] || Sparkles;
            
            // Handle different session types for better linking/display
            let href = `/apps/${session.app_name}?title=${encodeURIComponent(session.title)}`;
            let typeLabel = session.session_type.replace('_', ' ');
            
            if (session.session_type === 'saved_image' || session.session_type === 'podcast') {
              href = '/settings'; // Link to library in settings
            }
            
            // Format time ago
            const date = new Date(session.created_at);
            const now = new Date();
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
            let timeAgo = `${diffInMinutes}m ago`;
            if (diffInMinutes > 60) timeAgo = `${Math.floor(diffInMinutes / 60)}h ago`;
            if (diffInMinutes > 1440) timeAgo = `${Math.floor(diffInMinutes / 1440)}d ago`;

            return (
              <Link 
                key={session.id} 
                href={href}
                className="group flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{session.title}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{typeLabel} • {timeAgo}</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-3 h-3 text-slate-400" fill="currentColor" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
