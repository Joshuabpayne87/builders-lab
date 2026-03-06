'use client';

import { useEffect, useState } from 'react';
import { Bell, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  created_at: string;
  action_data?: Record<string, unknown>;
}

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('bl_crm_notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          setNotifications(data);
          const unread = data.filter(n => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notification changes
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bl_crm_notifications'
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('bl_crm_notifications')
        .update({ read: true })
        .eq('id', id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const dismiss = async (id: string) => {
    try {
      await supabase
        .from('bl_crm_notifications')
        .update({ dismissed: true })
        .eq('id', id);

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error dismissing notification:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-600/30 bg-red-600/10';
      case 'high':
        return 'border-orange-600/30 bg-orange-600/10';
      case 'medium':
        return 'border-yellow-600/30 bg-yellow-600/10';
      default:
        return 'border-slate-600/30 bg-slate-600/10';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showPanel && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.read ? 'bg-slate-900/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-start gap-2 flex-1">
                        {notification.type === 'FUNNEL_LEAD_CAPTURED' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-white">{notification.title}</h4>
                          <p className="text-xs text-slate-300 mt-0.5 break-words">{notification.message}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => dismiss(notification.id)}
                        className="text-slate-400 hover:text-slate-200 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 ml-6">
                      <span>{formatTime(notification.created_at)}</span>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/50 text-center">
              <a
                href="/apps/crm"
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                View all in CRM →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
