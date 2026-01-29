import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MemoryEventService } from "@/lib/memory-event-service";

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

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!params?.id || params.id === "undefined") {
    return NextResponse.json({ error: "Missing thread id." }, { status: 400 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: thread, error: threadError } = await supabase
    .from("bl_workshop_threads")
    .select("id, idea_id, owner_id, participant_id, created_at, bl_workshop_ideas (title, idea_type, status)")
    .eq("id", params.id)
    .maybeSingle();

  if (threadError) {
    console.error("Workshop thread fetch error:", threadError);
    return NextResponse.json(
      {
        error: "Failed to load thread.",
        debug: formatSupabaseError(threadError),
      },
      { status: 500 }
    );
  }

  if (!thread) {
    return NextResponse.json({ error: "Thread not found." }, { status: 404 });
  }

  const { data: messages, error: messageError } = await supabase
    .from("bl_workshop_thread_messages")
    .select("id, thread_id, sender_id, body, created_at")
    .eq("thread_id", params.id)
    .order("created_at", { ascending: true });

  if (messageError) {
    console.error("Workshop thread messages error:", messageError);
    return NextResponse.json(
      {
        error: "Failed to load messages.",
        debug: formatSupabaseError(messageError),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ thread, messages: messages || [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const message = body.body as string | undefined;

  if (!message) {
    return NextResponse.json({ error: "Missing message body." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bl_workshop_thread_messages")
    .insert({
      thread_id: params.id,
      sender_id: user.id,
      body: message,
    })
    .select()
    .single();

  if (error) {
    console.error("Workshop thread message create error:", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }

  await MemoryEventService.record({
    sourceApp: "workshop",
    sourceType: "thread_message",
    eventType: "created",
    sourceId: data.id,
    summary: `Thread message sent in ${params.id}: ${data.body}`,
    metadata: {
      thread_id: data.thread_id,
      sender_id: data.sender_id,
    },
    importance: 3,
  });

  return NextResponse.json({ message: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!params?.id || params.id === "undefined") {
    return NextResponse.json({ error: "Missing thread id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("bl_workshop_threads")
    .delete()
    .eq("id", params.id)
    .or(`owner_id.eq.${user.id},participant_id.eq.${user.id}`)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Workshop thread delete error:", error);
    return NextResponse.json({ error: "Failed to delete thread." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Thread not found." }, { status: 404 });
  }

  await MemoryEventService.record({
    sourceApp: "workshop",
    sourceType: "thread",
    eventType: "deleted",
    sourceId: params.id,
    summary: `Deleted workshop thread ${params.id}`,
    importance: 2,
  });

  return NextResponse.json({ success: true });
}
