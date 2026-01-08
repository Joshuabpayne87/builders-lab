"use client";

import React, { useState } from "react";
import { createTask } from "@/lib/calendar-client";
import { AppName } from "@/lib/session-service";
import { Calendar, Clock, Globe, Type, CheckCircle2, X } from "lucide-react";

interface ScheduleContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: {
    id: string;
    title: string;
    appName: AppName;
    contentType: "image" | "carousel" | "video" | "blog_post" | "social_post" | "podcast" | "infographic" | "story" | "reel" | "other";
  };
}

export default function ScheduleContentModal({
  isOpen,
  onClose,
  sessionData,
}: ScheduleContentModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [platform, setPlatform] = useState("linkedin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError("Please select a date");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const due_date = new Date(`${date}T${time}:00`).toISOString();
      
      await createTask({
        title: `Post: ${sessionData.title}`,
        due_date,
        platform: platform as any,
        content_type: sessionData.contentType,
        linked_session_id: sessionData.id,
        app_needed: sessionData.appName,
        status: "scheduled",
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to schedule task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Schedule Content</h3>
              <p className="text-sm text-gray-400">Plan when to post this content</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Scheduled!</h4>
            <p className="text-gray-400">Your content has been added to the calendar.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Date & Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  min={new Date().toISOString().split('T')[0]}
                />
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter (X)</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="blog">Blog</option>
                <option value="email">Email</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Type className="w-4 h-4" /> Content Type
              </label>
              <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 capitalize">
                {sessionData.contentType.replace('_', ' ')}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-all font-medium shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? "Scheduling..." : "Schedule Post"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
