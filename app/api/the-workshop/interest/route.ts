import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MemoryEventService } from "@/lib/memory-event-service";

type HandIntent = "interested" | "can_help" | "partner";

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
    .from("bl_workshop_interest")
    .select("id, idea_id, user_id, intent, message, contact, user_name, accepted_at, accepted_by, created_at")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Workshop hands list error:", error);
    return NextResponse.json({ error: "Failed to load hands." }, { status: 500 });
  }

  return NextResponse.json({ hands: data || [] });
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
  const intent = body.intent as HandIntent | undefined;

  if (!ideaId || !intent) {
    return NextResponse.json(
      { error: "Missing required fields: idea_id, intent" },
      { status: 400 }
    );
  }

  if (!["interested", "can_help", "partner"].includes(intent)) {
    return NextResponse.json(
      { error: "Invalid intent. Use interested, can_help, or partner." },
      { status: 400 }
    );
  }

  const { data: idea, error: ideaError } = await supabase
    .from("bl_workshop_ideas")
    .select("user_id")
    .eq("id", ideaId)
    .single();

  if (ideaError || !idea) {
    return NextResponse.json({ error: "Idea not found." }, { status: 404 });
  }

  if (idea.user_id === user.id) {
    return NextResponse.json(
      { error: "You cannot raise a hand on your own idea." },
      { status: 400 }
    );
  }

  const userName = user.user_metadata?.full_name || user.email || "Member";

  const { data, error } = await supabase
    .from("bl_workshop_interest")
    .insert({
      idea_id: ideaId,
      user_id: user.id,
      intent,
      message: body.message || null,
      contact: body.contact || null,
      user_name: userName,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You already raised a hand for this idea." },
        { status: 409 }
      );
    }

    console.error("Workshop hand raise error:", error);
    return NextResponse.json({ error: "Failed to raise hand." }, { status: 500 });
  }

  await MemoryEventService.record({
    sourceApp: "workshop",
    sourceType: "hand",
    eventType: "raised",
    sourceId: data.id,
    summary: `Raised hand on idea ${data.idea_id} as ${data.intent}`,
    metadata: {
      idea_id: data.idea_id,
      intent: data.intent,
    },
    importance: 3,
  });

  return NextResponse.json({ hand: data });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const action = body.action as string | undefined;

  if (action === "accept") {
    const ideaId = body.idea_id as string | undefined;
    const participantId = body.user_id as string | undefined;

    if (!ideaId || !participantId) {
      return NextResponse.json(
        { error: "Missing required fields: idea_id, user_id" },
        { status: 400 }
      );
    }

    const { data: idea, error: ideaError } = await supabase
      .from("bl_workshop_ideas")
      .select("id, user_id")
      .eq("id", ideaId)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json({ error: "Idea not found." }, { status: 404 });
    }

    if (idea.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { data: hand, error: updateError } = await supabase
      .from("bl_workshop_interest")
      .update({
        accepted_at: new Date().toISOString(),
        accepted_by: user.id,
      })
      .eq("idea_id", ideaId)
      .eq("user_id", participantId)
      .select()
      .single();

    if (updateError) {
      console.error("Workshop hand accept error:", updateError);
      return NextResponse.json({ error: "Failed to accept hand." }, { status: 500 });
    }

    await MemoryEventService.record({
      sourceApp: "workshop",
      sourceType: "hand",
      eventType: "accepted",
      sourceId: hand.id,
      summary: `Accepted hand for idea ${ideaId}`,
      metadata: {
        idea_id: ideaId,
        participant_id: participantId,
      },
      importance: 4,
    });

    const { data: existingThread, error: existingThreadError } = await supabase
      .from("bl_workshop_threads")
      .select("id, idea_id, owner_id, participant_id, created_at")
      .eq("idea_id", ideaId)
      .eq("participant_id", participantId)
      .maybeSingle();

    if (existingThreadError) {
      console.error("Workshop thread lookup error:", existingThreadError);
    }

    let thread = existingThread || null;

    if (!thread) {
      const { data: createdThread, error: threadError } = await supabase
        .from("bl_workshop_threads")
        .insert({
          idea_id: ideaId,
          owner_id: idea.user_id,
          participant_id: participantId,
        })
        .select("id, idea_id, owner_id, participant_id, created_at")
        .single();

      if (threadError) {
        if (threadError.code === "23505") {
          const { data: retryThread, error: retryError } = await supabase
            .from("bl_workshop_threads")
            .select("id, idea_id, owner_id, participant_id, created_at")
            .eq("idea_id", ideaId)
            .eq("participant_id", participantId)
            .maybeSingle();

          if (retryError) {
            console.error("Workshop thread retry error:", retryError);
            return NextResponse.json(
              { error: "Failed to load thread after accepting." },
              { status: 500 }
            );
          }

          thread = retryThread || null;
        } else {
          console.error("Workshop thread create error:", threadError);
          return NextResponse.json(
            { error: "Failed to create thread after accepting." },
            { status: 500 }
          );
        }
      } else {
        thread = createdThread;
      }
    }

    return NextResponse.json({ hand, thread });
  }

  const ideaId = body.idea_id as string | undefined;
  const intent = body.intent as HandIntent | undefined;
  const message = body.message as string | undefined;
  const contact = body.contact as string | undefined;

  if (!ideaId) {
    return NextResponse.json({ error: "Missing required field: idea_id" }, { status: 400 });
  }

  if (intent && !["interested", "can_help", "partner"].includes(intent)) {
    return NextResponse.json(
      { error: "Invalid intent. Use interested, can_help, or partner." },
      { status: 400 }
    );
  }

  const updates: Record<string, string | null> = {};
  if (intent) updates.intent = intent;
  if (message !== undefined) updates.message = message || null;
  if (contact !== undefined) updates.contact = contact || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bl_workshop_interest")
    .update(updates)
    .eq("idea_id", ideaId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Workshop hand update error:", error);
    return NextResponse.json({ error: "Failed to update hand." }, { status: 500 });
  }

  await MemoryEventService.record({
    sourceApp: "workshop",
    sourceType: "hand",
    eventType: "updated",
    sourceId: data.id,
    summary: `Updated hand on idea ${ideaId} to ${data.intent}`,
    metadata: {
      idea_id: data.idea_id,
      intent: data.intent,
    },
    importance: 2,
  });

  return NextResponse.json({ hand: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ideaId = searchParams.get("ideaId");
  const targetUserId = searchParams.get("userId") || user.id;

  if (!ideaId) {
    return NextResponse.json({ error: "Missing ideaId." }, { status: 400 });
  }

  if (targetUserId !== user.id) {
    const { data: idea, error: ideaError } = await supabase
      .from("bl_workshop_ideas")
      .select("user_id")
      .eq("id", ideaId)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json({ error: "Idea not found." }, { status: 404 });
    }

    if (idea.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
  }

  const { error } = await supabase
    .from("bl_workshop_interest")
    .delete()
    .eq("idea_id", ideaId)
    .eq("user_id", targetUserId);

  if (error) {
    console.error("Workshop hand delete error:", error);
    return NextResponse.json({ error: "Failed to remove hand." }, { status: 500 });
  }

  await MemoryEventService.record({
    sourceApp: "workshop",
    sourceType: "hand",
    eventType: "deleted",
    sourceId: ideaId,
    summary: `Removed hand from idea ${ideaId}`,
    metadata: {
      idea_id: ideaId,
      user_id: targetUserId,
    },
    importance: 2,
  });

  return NextResponse.json({ success: true });
}
