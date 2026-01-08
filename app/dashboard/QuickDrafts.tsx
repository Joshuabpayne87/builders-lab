"use client";

import { useState, useEffect } from "react";
import { Edit2, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { listTasks } from "@/lib/calendar-client";
import type { CalendarTask } from "@/lib/calendar-service";
import Link from "next/link";

export function QuickDrafts() {
  const [drafts, setDrafts] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch only 'draft' status tasks
        const data = await listTasks('draft', undefined, undefined, 3);
        setDrafts(data);
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Edit2 className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Drafts</h3>
        </div>
        <Link href="/calendar" className="text-[10px] text-slate-500 hover:text-white transition-colors">
          View All
        </Link>
      </div>

      <div className="flex-1 space-y-2">
        {drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 py-4">
            <p className="text-xs">No drafts pending</p>
            <Link href="/calendar" className="mt-2 text-[10px] font-bold text-blue-400 hover:text-blue-300">
              + New Task
            </Link>
          </div>
        ) : (
          drafts.map((task) => (
            <div 
              key={task.id} 
              className="group flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-xs font-medium text-white truncate mb-1">{task.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{task.platform || 'General'}</span>
                  {task.due_date && <span>Due {new Date(task.due_date).toLocaleDateString()}</span>}
                </div>
              </div>
              <Link 
                href="/calendar" // Ideally would open edit modal directly, but linking to calendar is safe fallback
                className="p-2 bg-white/5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
              >
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
