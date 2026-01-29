import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ThreadMessageSummary = {
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

const isDev = process.env.NODE_ENV !== "production";

function formatSupabaseError(error: unknown) {
  if (!isDev || !error || typeof error !== "object") {
    return undefined;
  }
  const err = error as { message?: string; code?: string; details?: string; hint?: string };
  return {
    message: err.message,
    code: err.code,
    details: err.details,
    hint: err.hint,
  };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ideaId = searchParams.get("ideaId");

  let query = supabase
    .from("bl_workshop_threads")
    .select("id, idea_id, owner_id, participant_id, created_at, bl_workshop_ideas (title, idea_type, status)")
    .or(`owner_id.eq.${user.id},participant_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (ideaId) {
    query = query.eq("idea_id", ideaId);
  }

  const { data: threads, error } = await query;

  if (error) {
    console.error("Workshop threads list error:", error);
    return NextResponse.json(
      {
        error: "Failed to load threads.",
        debug: formatSupabaseError(error),
      },
      { status: 500 }
    );
  }

  const threadIds = (threads || []).map(thread => thread.id);
  let lastMessageMap = new Map<string, ThreadMessageSummary>();

  if (threadIds.length > 0) {
    const { data: messages, error: messageError } = await supabase
      .from("bl_workshop_thread_messages")
      .select("thread_id, sender_id, body, created_at")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: false });

    if (messageError) {
      console.error("Workshop threads messages lookup error:", messageError);
    } else {
      (messages || []).forEach(message => {
        if (!lastMessageMap.has(message.thread_id)) {
          lastMessageMap.set(message.thread_id, message as ThreadMessageSummary);
        }
      });
    }
  }

  const threadsWithLastMessage = (threads || []).map(thread => ({
    ...thread,
    last_message: lastMessageMap.get(thread.id) || null,
  }));

  return NextResponse.json({ threads: threadsWithLastMessage });
}
