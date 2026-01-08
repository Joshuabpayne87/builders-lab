"use client";

import { useCalendarNotifications } from "@/hooks/useCalendarNotifications";

export default function GlobalNotifications() {
  useCalendarNotifications();
  return null; // This component doesn't render anything
}
