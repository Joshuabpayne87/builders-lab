"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  Trash2,
  Edit2,
  X,
  AlertCircle,
} from "lucide-react";
import {
  createTask,
  listTasks,
  updateTask,
  deleteTask,
  getTaskStats,
} from "@/lib/calendar-client";
import type { CalendarTask, TaskStatus, ContentPlatform, ContentType } from "@/lib/calendar-service";

type ViewMode = "calendar" | "list";

const STATUS_COLORS: Record<TaskStatus, string> = {
  draft: "bg-slate-500",
  in_progress: "bg-blue-500",
  scheduled: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PLATFORMS: { value: ContentPlatform; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "blog", label: "Blog" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
];

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "image", label: "Image" },
  { value: "carousel", label: "Carousel" },
  { value: "video", label: "Video" },
  { value: "blog_post", label: "Blog Post" },
  { value: "social_post", label: "Social Post" },
  { value: "podcast", label: "Podcast" },
  { value: "infographic", label: "Infographic" },
  { value: "story", label: "Story" },
  { value: "reel", label: "Reel" },
  { value: "other", label: "Other" },
];

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<CalendarTask | null>(null);
  const [stats, setStats] = useState<Record<TaskStatus, number> | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    status: "draft" as TaskStatus,
    platform: "" as ContentPlatform | "",
    content_type: "" as ContentType | "",
  });

  useEffect(() => {
    loadTasks();
    loadStats();
  }, [currentDate]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const allTasks = await listTasks(
        undefined,
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );
      setTasks(allTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const taskStats = await getTaskStats();
      setStats(taskStats);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        status: formData.status,
        platform: formData.platform || undefined,
        content_type: formData.content_type || undefined,
      });

      setShowCreateModal(false);
      resetForm();
      loadTasks();
      loadStats();
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      await updateTask(editingTask.id, {
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        status: formData.status,
        platform: formData.platform || undefined,
        content_type: formData.content_type || undefined,
      });

      setEditingTask(null);
      resetForm();
      loadTasks();
      loadStats();
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task. Please try again.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;

    try {
      await deleteTask(id);
      loadTasks();
      loadStats();
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task. Please try again.");
    }
  };

  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      loadTasks();
      loadStats();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      due_date: "",
      status: "draft",
      platform: "",
      content_type: "",
    });
  };

  const openEditModal = (task: CalendarTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      due_date: task.due_date.split("T")[0],
      status: task.status,
      platform: task.platform || "",
      content_type: task.content_type || "",
    });
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingTask(null);
    resetForm();
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return taskDate.getDate() === date.getDate() &&
             taskDate.getMonth() === date.getMonth() &&
             taskDate.getFullYear() === date.getFullYear();
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = new Date();
  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
      </div>

      {/* Navigation */}
      <nav className="relative border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <h1 className="text-lg font-semibold text-white">Content Calendar</h1>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 py-8">
        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {Object.entries(stats).map(([status, count]) => (
              <div
                key={status}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[status as TaskStatus]}`}></div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    {STATUS_LABELS[status as TaskStatus]}
                  </p>
                </div>
                <p className="text-2xl font-semibold text-white">{count}</p>
              </div>
            ))}
          </div>
        )}

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-white text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={previousMonth}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-white font-semibold text-lg min-w-[200px] text-center">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : viewMode === "calendar" ? (
          /* Calendar View */
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-white/10">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {getDaysInMonth().map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="border-r border-b border-white/5 bg-white/0" />;
                }

                const dayTasks = getTasksForDate(date);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={date.toISOString()}
                    className={`border-r border-b border-white/5 p-2 min-h-[120px] ${
                      isTodayDate ? "bg-white/5" : "bg-white/0"
                    } hover:bg-white/5 transition-colors`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-sm font-semibold ${
                          isTodayDate ? "text-white" : "text-slate-400"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {isTodayDate && (
                        <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">
                          TODAY
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <button
                          key={task.id}
                          onClick={() => openEditModal(task)}
                          className="w-full text-left p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[task.status]}`} />
                            <p className="text-xs text-white truncate flex-1">
                              {task.title}
                            </p>
                          </div>
                          {task.platform && (
                            <p className="text-[10px] text-slate-500 uppercase">
                              {task.platform}
                            </p>
                          )}
                        </button>
                      ))}
                      {dayTasks.length > 3 && (
                        <p className="text-[10px] text-slate-500 text-center py-1">
                          +{dayTasks.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
                <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Create your first task to start planning your content
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-lg transition-all text-sm font-medium"
                >
                  Create Task
                </button>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[task.status]}`} />
                        <h3 className="text-base font-semibold text-white truncate">
                          {task.title}
                        </h3>
                      </div>

                      {task.description && (
                        <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                        {task.platform && (
                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-slate-300 uppercase tracking-wider font-medium">
                            {task.platform}
                          </span>
                        )}
                        {task.content_type && (
                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-slate-300">
                            {CONTENT_TYPES.find(ct => ct.value === task.content_type)?.label}
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-slate-300">
                          {STATUS_LABELS[task.status]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.status !== "completed" && (
                        <button
                          onClick={() => handleQuickStatusChange(task.id, "completed")}
                          className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Mark as complete"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="e.g., Create Instagram carousel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="Add details about this task..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value as ContentPlatform })}
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="">Select platform...</option>
                  {PLATFORMS.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Content Type
                </label>
                <select
                  value={formData.content_type}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value as ContentType })}
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="">Select type...</option>
                  {CONTENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-white text-black hover:bg-white/90 rounded-lg transition-colors text-sm font-medium"
                >
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
