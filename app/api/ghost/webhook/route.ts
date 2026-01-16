import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type GhostWebhookPayload = {
  meta?: { event?: string };
  member?: {
    id?: string;
    email?: string;
    name?: string;
    status?: string;
  };
  subscription?: {
    price?: { id?: string };
    plan?: { id?: string };
  };
};

function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const [algo, digest] = signature.split("=");
  if (algo !== "sha256" || !digest) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected.length !== digest.length) return false;

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(digest));
}

function getPriceId(payload: GhostWebhookPayload) {
  return (
    payload.subscription?.price?.id ||
    payload.subscription?.plan?.id ||
    null
  );
}

async function findUserByEmail(admin: ReturnType<typeof createAdminClient>, email: string) {
  const normalizedEmail = email.toLowerCase();
  let page = 1;
  const perPage = 200;
  const maxPages = 50;

  while (page <= maxPages) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    const match = data.users.find(user => user.email?.toLowerCase() === normalizedEmail);
    if (match) {
      return match;
    }

    if (!data.nextPage || page >= data.lastPage) {
      break;
    }

    page = data.nextPage;
  }

  return null;
}

export async function POST(request: Request) {
  const secret = process.env.GHOST_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing GHOST_WEBHOOK_SECRET." }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-ghost-signature");
  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid Ghost signature." }, { status: 401 });
  }

  let payload: GhostWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const member = payload.member;
  const email = member?.email?.toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: true, skipped: "missing-member-email" });
  }

  const admin = createAdminClient();
  let user: { id: string; email?: string | null } | null = null;
  try {
    user = await findUserByEmail(admin, email);
  } catch (error) {
    return NextResponse.json({ error: "Failed to look up user." }, { status: 500 });
  }

  const status = member?.status ?? "free";
  const priceId = getPriceId(payload);
  const allowedPriceIds = (process.env.GHOST_ALLOWED_PRICE_IDS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

  const priceMatches = !allowedPriceIds.length || !priceId || allowedPriceIds.includes(priceId);
  const isPaid = (status === "paid" || status === "comped") && priceMatches;

  if (!user) {
    const { error: claimError } = await admin
      .from("bl_membership_claims")
      .upsert(
        {
          email,
          is_paid: isPaid,
          status,
          ghost_member_id: member?.id ?? null,
          ghost_price_id: priceId,
          ghost_last_event: payload.meta?.event ?? null,
          ghost_last_event_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

    if (claimError) {
      return NextResponse.json({ error: "Failed to store membership claim." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, stored: "membership-claim" });
  }

  const { error: upsertError } = await admin
    .from("bl_memberships")
    .upsert(
      {
        user_id: user.id,
        is_paid: isPaid,
        status,
        ghost_member_id: member?.id ?? null,
        ghost_member_email: email,
        ghost_price_id: priceId,
        ghost_last_event: payload.meta?.event ?? null,
        ghost_last_event_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    return NextResponse.json({ error: "Failed to update membership." }, { status: 500 });
  }

  await admin.from("bl_membership_claims").delete().eq("email", email);

  return NextResponse.json({ ok: true });
}
