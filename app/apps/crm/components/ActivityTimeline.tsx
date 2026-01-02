"use client";

import { useState } from "react";
import { Mail, Phone, Calendar, FileText, CheckSquare, Check, X, Trash2, Edit } from "lucide-react";
import { toggleActivityCompletedAction, deleteActivityAction } from "../actions";
import type { Activity } from "../types";
import { getActivityTypeColor } from "../constants";

interface ActivityTimelineProps {
  activities: Activity[];
  onEdit?: (activity: Activity) => void;
}

const activityIcons = {
  EMAIL: Mail,
  CALL: Phone,
  MEETING: Calendar,
  NOTE: FileText,
  TASK: CheckSquare,
};

export function ActivityTimeline({ activities, onEdit }: ActivityTimelineProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleToggleComplete = async (activity: Activity) => {
    setProcessingIds((prev) => new Set(prev).add(activity.id));
    try {
      await toggleActivityCompletedAction(activity.id, !activity.completed);
    } catch (error) {
      console.error("Failed to toggle activity:", error);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(activity.id);
        return next;
      });
    }
  };

  const handleDelete = async (activityId: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;

    setProcessingIds((prev) => new Set(prev).add(activityId));
    try {
      await deleteActivityAction(activityId);
    } catch (error) {
      console.error("Failed to delete activity:", error);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(activityId);
        return next;
      });
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">No activities yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.activity_type];
        const isProcessing = processingIds.has(activity.id);
        const colorClass = getActivityTypeColor(activity.activity_type);

        return (
          <div
            key={activity.id}
            className="relative pl-8 pb-4 group"
            style={{
              borderLeft: index !== activities.length - 1 ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
            }}
          >
            {/* Timeline dot */}
            <div className="absolute left-0 -translate-x-1/2 top-0">
              <div className={`w-8 h-8 rounded-lg border ${colorClass} flex items-center justify-center`}>
                <Icon className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>

            {/* Activity content */}
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-4 transition-all ml-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {activity.title}
                    </h4>
                    <span className={`px-2 py-0.5 text-xs rounded-md ${colorClass}`}>
                      {activity.activity_type}
                    </span>
                    {activity.completed && (
                      <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(activity.created_at).toLocaleString()}
                    {activity.due_date && (
                      <span className="ml-2">
                        • Due: {new Date(activity.due_date).toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {activity.activity_type === "TASK" && (
                    <button
                      onClick={() => handleToggleComplete(activity)}
                      disabled={isProcessing}
                      className="p-1.5 hover:bg-white/5 rounded transition-colors disabled:opacity-50"
                      title={activity.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {activity.completed ? (
                        <X className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(activity)}
                      disabled={isProcessing}
                      className="p-1.5 hover:bg-white/5 rounded transition-colors disabled:opacity-50"
                      title="Edit activity"
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(activity.id)}
                    disabled={isProcessing}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors disabled:opacity-50"
                    title="Delete activity"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {activity.description && (
                <p className="text-sm text-slate-400 leading-relaxed">
                  {activity.description}
                </p>
              )}

              {activity.ai_summary && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-slate-500 mb-1">AI Summary</p>
                  <p className="text-sm text-slate-300">{activity.ai_summary}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
