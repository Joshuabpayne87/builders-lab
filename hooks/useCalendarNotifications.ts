"use client";

import { useEffect, useRef } from "react";
import { getUpcomingTasks, getIncompleteTasks } from "@/lib/calendar-client";
import { createClient } from "@/lib/supabase/client";

export function useCalendarNotifications() {
  const lastCheckedRef = useRef<number>(0);
  const notifiedTasksRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request notification permission on mount
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const checkNotifications = async () => {
      try {
        // Only check every 5 minutes to be respectful of resources
        const now = Date.now();
        if (now - lastCheckedRef.current < 5 * 60 * 1000) return;
        lastCheckedRef.current = now;

        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const upcoming = await getUpcomingTasks(1); // 1 hour ahead
        const incomplete = await getIncompleteTasks();

        if (Notification.permission === 'granted') {
          upcoming.forEach(task => {
            // Only notify if not already notified and doesn't have linked content
            if (!notifiedTasksRef.current.has(task.id) && !task.has_linked_session) {
              const notification = new Notification(`📅 Task Due Soon: ${task.title}`, {
                body: `Due in less than 1 hour. Time to create your content!`,
                icon: '/hero-banner.png', // Fallback to hero banner if no icon
                tag: task.id,
              });

              notification.onclick = () => {
                window.focus();
                window.location.href = '/calendar';
              };

              notifiedTasksRef.current.add(task.id);
            }
          });

          incomplete.forEach(task => {
            // Only notify if not already notified
            if (!notifiedTasksRef.current.has(task.id)) {
              const notification = new Notification(`⚠️ Overdue Task: ${task.title}`, {
                body: `This task is overdue and has no content created yet.`,
                icon: '/hero-banner.png',
                tag: task.id,
              });

              notification.onclick = () => {
                window.focus();
                window.location.href = '/calendar';
              };

              notifiedTasksRef.current.add(task.id);
            }
          });
        }
      } catch (error) {
        if (error instanceof Error && /(401|403|405)/.test(error.message)) {
          return;
        }
        console.error("Failed to check calendar notifications:", error);
      }
    };

    // Check immediately and then every 5 minutes
    checkNotifications();
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
