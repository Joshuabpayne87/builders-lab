"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { getUpcomingTasks, getIncompleteTasks } from "@/lib/calendar-client";
import type { UpcomingTask, IncompleteTask } from "@/lib/calendar-service";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500",
  in_progress: "bg-blue-500",
  scheduled: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

export function CalendarWidget() {
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [incompleteTasks, setIncompleteTasks] = useState<IncompleteTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const [upcoming, incomplete] = await Promise.all([
        getUpcomingTasks(48), // Next 48 hours
        getIncompleteTasks(),
      ]);
      setUpcomingTasks(upcoming);
      setIncompleteTasks(incomplete);
    } catch (error) {
      console.error("Failed to load calendar tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 0) {
      return "Overdue";
    } else if (diffHours < 1) {
      return "Less than 1h";
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else {
      return `${diffDays}d`;
    }
  };

  const displayTasks = [
    ...incompleteTasks.map(t => ({ ...t, isIncomplete: true })),
    ...upcomingTasks.map(t => ({ ...t, isIncomplete: false }))
  ].slice(0, 5);

  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
          Upcoming Tasks
        </h2>
        <Link
          href="/calendar"
          className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
        >
          View Calendar
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {displayTasks.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400 mb-4">No upcoming tasks</p>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Calendar className="w-4 h-4" />
            Create Task
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {displayTasks.map((task) => {
            const isTaskIncomplete = task.isIncomplete;
            const taskStatus = 'status' in task ? (task.status as string) : null;
            const statusColor = isTaskIncomplete
              ? 'bg-red-500 animate-pulse'
              : (taskStatus && STATUS_COLORS[taskStatus] ? STATUS_COLORS[taskStatus] : 'bg-slate-500');

            return (
              <Link
                key={task.id}
                href="/calendar"
                className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10 group"
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor}`}></div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-white font-medium truncate">
                      {task.title}
                    </p>
                    {isTaskIncomplete && (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {task.platform && (
                      <span className="uppercase tracking-wider">{task.platform}</span>
                    )}
                    {task.content_type && (
                      <>
                        <span>•</span>
                        <span>{task.content_type.replace('_', ' ')}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!task.has_linked_session && (
                    <span className="text-[10px] px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded border border-yellow-500/20 font-medium">
                      No content
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Clock className="w-3 h-3" />
                    <span className={isTaskIncomplete ? 'text-red-400 font-medium' : ''}>
                      {formatDate(task.due_date)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {(upcomingTasks.length + incompleteTasks.length) > 5 && (
            <Link
              href="/calendar"
              className="block text-center py-3 text-xs text-slate-500 hover:text-white transition-colors"
            >
              +{upcomingTasks.length + incompleteTasks.length - 5} more tasks
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
