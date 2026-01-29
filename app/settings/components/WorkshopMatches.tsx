"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Loader2, Users } from "lucide-react";

interface WorkshopThread {
  id: string;
  idea_id: string;
  owner_id: string;
  participant_id: string;
  created_at?: string | null;
  bl_workshop_ideas?: {
    title?: string | null;
    idea_type?: string | null;
    status?: string | null;
  } | null;
}

export default function WorkshopMatches() {
  const [threads, setThreads] = useState<WorkshopThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadThreads = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/the-workshop/threads");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load collaborations.");
          setThreads([]);
          return;
        }
        setThreads(data.threads || []);
      } catch (err) {
        console.error("Workshop threads load error:", err);
        setError("Failed to load collaborations.");
        setThreads([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadThreads();
  }, []);

  const handleDeleteThread = async (threadId: string) => {
    if (!window.confirm("Delete this collaboration chat?")) return;
    setDeletingId(threadId);
    setError(null);

    try {
      const res = await fetch(`/api/the-workshop/threads/${threadId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete collaboration.");
        return;
      }
      setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
    } catch (err) {
      console.error("Workshop thread delete error:", err);
      setError("Failed to delete collaboration.");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-500">Loading collaborations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
        <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400">No accepted collaborations yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <div
          key={thread.id}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 flex flex-col gap-3"
        >
          <div>
            <p className="text-sm font-semibold text-white">
              {thread.bl_workshop_ideas?.title || "Workshop Collaboration"}
            </p>
            <p className="text-xs text-slate-500">
              Status: {thread.bl_workshop_ideas?.status || "active"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/the-workshop?threadId=${thread.id}&ideaId=${thread.idea_id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg text-xs font-semibold transition-colors w-fit"
            >
              <MessageSquare className="w-4 h-4" />
              Open Chat
            </Link>
            <button
              onClick={() => handleDeleteThread(thread.id)}
              disabled={deletingId === thread.id}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
