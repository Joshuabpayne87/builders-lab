import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MemoryEventService } from "@/lib/memory-event-service";

type IdeaType = "partnership" | "question" | "offer";
type IdeaStatus = "open" | "matched" | "paused" | "closed";
type HandIntent = "interested" | "can_help" | "partner";

interface HandCounts {
  interested: number;
  can_help: number;
  partner: number;
  total: number;
  accepted: number;
}

const requiredFields = [
  "title",
  "idea_type",
  "problem",
  "target_audience",
  "desired_outcome",
  "needs",
  "ideal_partner",
  "timeline",
  "commitment",
];

function normalizeTags(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map(tag => String(tag).trim()).filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);
  }
  return [];
}

export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: ideas, error } = await supabase
    .from("bl_workshop_ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Workshop ideas list error:", error);
    return NextResponse.json({ error: "Failed to load ideas." }, { status: 500 });
  }

  const ideaIds = (ideas || []).map(idea => idea.id);

  const handCountsMap = new Map<string, HandCounts>();
  const myHandsMap = new Map<string, { intent: HandIntent; accepted: boolean }>();

  if (ideaIds.length > 0) {
    const { data: allHands, error: allHandsError } = await supabase
      .from("bl_workshop_interest")
      .select("idea_id, intent, accepted_at")
      .in("idea_id", ideaIds);

    if (allHandsError) {
      console.error("Workshop hands count error:", allHandsError);
    } else {
      (allHands || []).forEach(hand => {
        if (!hand.idea_id) return;
        const existing = handCountsMap.get(hand.idea_id) || {
          interested: 0,
          can_help: 0,
          partner: 0,
          total: 0,
          accepted: 0,
        };

        if (hand.intent === "interested") existing.interested += 1;
        if (hand.intent === "can_help") existing.can_help += 1;
        if (hand.intent === "partner") existing.partner += 1;
        existing.total += 1;
        if (hand.accepted_at) existing.accepted += 1;

        handCountsMap.set(hand.idea_id, existing);
      });
    }

    const { data: myHands, error: myHandsError } = await supabase
      .from("bl_workshop_interest")
      .select("idea_id, intent, accepted_at")
      .eq("user_id", user.id)
      .in("idea_id", ideaIds);

    if (myHandsError) {
      console.error("Workshop hands lookup error:", myHandsError);
    } else {
      (myHands || []).forEach(hand => {
        if (hand.idea_id && hand.intent) {
          myHandsMap.set(hand.idea_id, {
            intent: hand.intent as HandIntent,
            accepted: Boolean(hand.accepted_at),
          });
        }
      });
    }
  }

  const ideasWithHands = (ideas || []).map(idea => {
    const myHand = myHandsMap.get(idea.id) || null;
    return {
      ...idea,
      is_owner: idea.user_id === user.id,
      hand_counts: handCountsMap.get(idea.id) || {
        interested: 0,
        can_help: 0,
        partner: 0,
        total: 0,
        accepted: 0,
      },
      my_hand_intent: myHand?.intent || null,
      my_hand_accepted: myHand?.accepted || false,
    };
  });

  return NextResponse.json({ ideas: ideasWithHands });
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
  const ideaId = body?.id as string | undefined;
  const status = body?.status as IdeaStatus | undefined;

  if (!ideaId || !status) {
    return NextResponse.json(
      { error: "Missing required fields: id, status" },
      { status: 400 }
    );
  }

  if (!["open", "matched", "paused", "closed"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status. Use open, matched, paused, or closed." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("bl_workshop_ideas")
    .update({ status })
    .eq("id", ideaId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Workshop idea status update error:", error);
    return NextResponse.json({ error: "Failed to update idea." }, { status: 500 });
  }

  await MemoryEventService.record({
    sourceApp: "workshop",
    sourceType: "idea",
    eventType: "status_updated",
    sourceId: data.id,
    summary: `Updated workshop idea status to ${data.status}: ${data.title}`,
    metadata: {
      idea_type: data.idea_type,
      status: data.status,
    },
    importance: 3,
  });

  return NextResponse.json({ idea: data });
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
  const missing = requiredFields.filter(field => !body?.[field]);

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const ideaType = body.idea_type as IdeaType;
  if (!["partnership", "question", "offer"].includes(ideaType)) {
    return NextResponse.json(
      { error: "Invalid idea_type. Use partnership, question, or offer." },
      { status: 400 }
    );
  }

  const tags = normalizeTags(body.tags);
  const authorName = user.user_metadata?.full_name || user.email || "Member";
  const authorAvatarUrl = user.user_metadata?.avatar_url || null;

  const { data, error } = await supabase
    .from("bl_workshop_ideas")
    .insert({
      user_id: user.id,
      title: body.title,
      idea_type: ideaType,
      problem: body.problem,
      target_audience: body.target_audience,
      current_assets: body.current_assets || null,
      desired_outcome: body.desired_outcome,
      needs: body.needs,
      ideal_partner: body.ideal_partner,
      timeline: body.timeline,
      commitment: body.commitment,
      tags,
      author_name: authorName,
      author_avatar_url: authorAvatarUrl,
    })
    .select()
    .single();

  if (error) {
    console.error("Workshop idea create error:", error);
    return NextResponse.json({ error: "Failed to create idea." }, { status: 500 });
  }

  await MemoryEventService.record({
    sourceApp: "workshop",
    sourceType: "idea",
    eventType: "created",
    sourceId: data.id,
    summary: `Created workshop idea: ${data.title}`,
    metadata: {
      idea_type: data.idea_type,
      status: data.status,
      tags: data.tags || [],
    },
    importance: 4,
  });

  return NextResponse.json({ idea: data });
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
  let ideaId = searchParams.get("id");

  if (!ideaId) {
    try {
      const body = await request.json();
      ideaId = body?.id as string | undefined;
    } catch {}
  }

  if (!ideaId) {
    return NextResponse.json({ error: "Missing idea id." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bl_workshop_ideas")
    .delete()
    .eq("id", ideaId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Workshop idea delete error:", error);
    return NextResponse.json({ error: "Failed to delete idea." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Idea not found." }, { status: 404 });
  }

  await MemoryEventService.record({
    sourceApp: "workshop",
    sourceType: "idea",
    eventType: "deleted",
    sourceId: data.id,
    summary: `Deleted workshop idea ${data.id}`,
    importance: 2,
  });

  return NextResponse.json({ success: true });
}
