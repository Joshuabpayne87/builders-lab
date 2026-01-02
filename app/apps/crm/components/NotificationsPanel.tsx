"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react";
import type { Notification } from "../types";
import {
  markNotificationReadAction,
  dismissNotificationAction,
  runWorkflowsAction,
} from "../actions/workflowActions";

interface NotificationsPanelProps {
  initialNotifications: Notification[];
}

export function NotificationsPanel({ initialNotifications }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isRunning, setIsRunning] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    await markNotificationReadAction(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDismiss = async (id: string) => {
    await dismissNotificationAction(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleRunWorkflows = async () => {
    setIsRunning(true);
    await runWorkflowsAction();
    setIsRunning(false);
    // Refresh page to get new notifications
    window.location.reload();
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "OVERDUE_TASK":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "STALE_CONTACT":
        return <Users className="w-4 h-4 text-orange-400" />;
      case "DEAL_UPDATE":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "INSIGHT":
        return <Info className="w-4 h-4 text-blue-400" />;
      case "REMINDER":
        return <Clock className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500";
      case "high":
        return "border-l-orange-500";
      case "medium":
        return "border-l-blue-500";
      case "low":
        return "border-l-slate-500";
      default:
        return "border-l-slate-500";
    }
  };

  return (
    <>
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="hidden md:inline">Notifications</span>
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-[#0A0A0A] border-l border-white/10 z-50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Run Workflows Button */}
              <button
                onClick={handleRunWorkflows}
                disabled={isRunning}
                className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-slate-600 rounded-lg text-sm transition-colors font-medium"
              >
                {isRunning ? "Running Workflows..." : "Run Automated Checks"}
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">All caught up!</h3>
                  <p className="text-sm text-slate-500">
                    You have no notifications. Run automated checks to find opportunities.
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 bg-white/5 border-l-4 ${getPriorityColor(
                        notification.priority
                      )} rounded-lg ${!notification.read ? "border border-white/20" : "border border-transparent"}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2 flex-1">
                          {getIcon(notification.type)}
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-white mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-slate-400">{notification.message}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDismiss(notification.id)}
                          className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                        >
                          <X className="w-3 h-3 text-slate-500" />
                        </button>
                      </div>

                      {/* Action Button */}
                      {notification.action_data?.url && (
                        <Link
                          href={notification.action_data.url}
                          onClick={() => {
                            handleMarkRead(notification.id);
                            setIsOpen(false);
                          }}
                          className="mt-2 inline-block px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition-colors"
                        >
                          {notification.action_data.suggested_action || "View"}
                        </Link>
                      )}

                      {/* Timestamp */}
                      <p className="text-xs text-slate-600 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
