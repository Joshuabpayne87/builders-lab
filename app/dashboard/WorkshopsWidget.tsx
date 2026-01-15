"use client";

import { useEffect, useState } from "react";
import { Video, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { getNextWorkshop } from "@/lib/workshops-client";
import type { Workshop } from "@/lib/workshops-service";

export function WorkshopsWidget() {
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkshop();
  }, []);

  const loadWorkshop = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getNextWorkshop();
      setWorkshop(data);
    } catch (err) {
      console.error("Failed to load workshop:", err);
      setError("Failed to load workshop");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Video className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Live Workshop
          </h2>
        </div>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Video className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Live Workshop
          </h2>
        </div>
        <div className="text-center py-8">
          <Video className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No workshops scheduled</p>
          <p className="text-xs text-slate-600 mt-1">Check back soon for upcoming live sessions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Video className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
          Live Workshop
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(workshop.scheduled_at)}</span>
        </div>
      </div>

      <a
        href={workshop.meeting_link}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        {/* Cover Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/20 transition-all mb-4">
          {workshop.cover_image_url ? (
            <img
              src={workshop.cover_image_url}
              alt={workshop.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <Video className="w-16 h-16 text-white/20" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-black font-medium text-sm">
              <span>Join Workshop</span>
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-white/90 transition-colors mb-1">
            {workshop.title}
          </h3>
          {workshop.description && (
            <p className="text-sm text-slate-400 line-clamp-2">
              {workshop.description}
            </p>
          )}
        </div>
      </a>
    </div>
  );
}
