"use client";

import { useState, useEffect } from "react";
import { StickyNote, Plus, Check, Save, Loader2 } from "lucide-react";
import { createTask } from "@/lib/calendar-client";
import { saveSession } from "@/lib/session-client";
import { toast } from "sonner";

export function Scratchpad() {
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Load from localStorage on mount (for draft)
  useEffect(() => {
    const saved = localStorage.getItem("dashboard_scratchpad_draft");
    if (saved) setNote(saved);
  }, []);

  // Sync draft to localStorage
  useEffect(() => {
    localStorage.setItem("dashboard_scratchpad_draft", note);
  }, [note]);

  const handleSaveNote = async () => {
    if (!note.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const firstLine = note.split('\n')[0];
      const title = firstLine.substring(0, 50) || "Quick Note";

      await saveSession({
        appName: 'scratchpad' as any,
        sessionType: 'note',
        title: title,
        data: { content: note },
        metadata: { length: note.length }
      });

      toast.success("Note saved to library");
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (e) {
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvertToTask = async () => {
    if (!note.trim() || isCreatingTask) return;
    setIsCreatingTask(true);
    try {
      const lines = note.split('\n');
      const title = lines[0].substring(0, 50) + (lines[0].length > 50 ? '...' : '');
      const description = note;

      await createTask({
        title,
        description,
        due_date: new Date().toISOString(),
        status: 'draft'
      });

      toast.success("Task created from note");
      setNote(""); 
      localStorage.removeItem("dashboard_scratchpad_draft");
    } catch (e) {
      toast.error("Failed to create task");
    } finally {
      setIsCreatingTask(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Scratchpad</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSaveNote}
            disabled={!note.trim() || isSaving}
            className="text-[10px] bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
            title="Save to Library"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : justSaved ? <Check className="w-3 h-3 text-green-400" /> : <Save className="w-3 h-3" />}
            {justSaved ? "Saved" : "Save"}
          </button>
          <button 
            onClick={handleConvertToTask}
            disabled={!note.trim() || isCreatingTask}
            className="text-[10px] bg-blue-600/20 hover:bg-blue-600/40 disabled:opacity-50 text-blue-400 px-2 py-1 rounded transition-colors flex items-center gap-1"
            title="Convert to Task"
          >
            {isCreatingTask ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Task
          </button>
        </div>
      </div>

      <textarea
        className="flex-1 bg-black/20 border border-white/5 rounded-lg p-3 text-xs text-slate-300 resize-none focus:outline-none focus:border-white/10 placeholder:text-slate-600"
        placeholder="Quick idea? Jot it down here..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
    </div>
  );
}
