import { createClient } from "@/lib/supabase/server";

export type MemoryEventSourceApp =
  | "assistant"
  | "calendar"
  | "workshop"
  | "apps"
  | "crm"
  | "invoices";

export interface MemoryEventParams {
  sourceApp: MemoryEventSourceApp;
  sourceType: string;
  eventType: string;
  summary: string;
  sourceId?: string;
  importance?: number;
  metadata?: Record<string, unknown>;
}

function clampImportance(value?: number) {
  if (!value || Number.isNaN(value)) return 1;
  return Math.min(5, Math.max(1, Math.round(value)));
}

function normalizeSummary(value: string, maxLength = 240) {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 3)}...`;
}

export class MemoryEventService {
  static async record(params: MemoryEventParams): Promise<boolean> {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return false;
      }

      const { error } = await supabase.from("bl_memory_events").insert({
        user_id: user.id,
        source_app: params.sourceApp,
        source_type: params.sourceType,
        event_type: params.eventType,
        source_id: params.sourceId || null,
        summary: normalizeSummary(params.summary),
        metadata: params.metadata || {},
        importance: clampImportance(params.importance),
      });

      if (error) {
        console.warn("Memory event insert failed:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn("Memory event record failed:", error);
      return false;
    }
  }
}
