import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MemoryEventService } from "@/lib/memory-event-service";

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

  if (!ideaId) {
    return NextResponse.json({ error: "Missing ideaId." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bl_workshop_questions")
    .select("id, idea_id, user_id, body, author_name, author_avatar_url, created_at")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Workshop questions list error:", error);
    return NextResponse.json({ error: "Failed to load questions." }, { status: 500 });
  }

  return NextResponse.json({ questions: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const ideaId = body.idea_id as string | undefined;
  const message = body.body as string | undefined;

  if (!ideaId || !message) {
    return NextResponse.json(
      { error: "Missing required fields: idea_id, body" },
      { status: 400 }
    );
  }

  const authorName = user.user_metadata?.full_name || user.email || "Member";
  const authorAvatarUrl = user.user_metadata?.avatar_url || null;

  const { data, error } = await supabase
    .from("bl_workshop_questions")
    .insert({
      idea_id: ideaId,
      user_id: user.id,
      body: message,
      author_name: authorName,
      author_avatar_url: authorAvatarUrl,
    })
    .select()
    .single();

  if (error) {
    console.error("Workshop question create error:", error);
    return NextResponse.json({ error: "Failed to post question." }, { status: 500 });
  }

  await MemoryEventService.record({
    sourceApp: "workshop",
    sourceType: "question",
    eventType: "created",
    sourceId: data.id,
    summary: `Asked question on idea ${data.idea_id}: ${data.body}`,
    metadata: {
      idea_id: data.idea_id,
    },
    importance: 3,
  });

  return NextResponse.json({ question: data });
}
