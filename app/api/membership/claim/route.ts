import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type GhostMember = {
  id?: string;
  email?: string;
  status?: string;
  subscriptions?: Array<{
    status?: string;
    price?: { id?: string };
    plan?: { id?: string };
  }>;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function createGhostAdminToken(apiKey: string) {
  const [id, secret] = apiKey.split(":");
  if (!id || !secret) return null;

  const header = { alg: "HS256", typ: "JWT", kid: id };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iat: now, exp: now + 5 * 60, aud: "/admin/" };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureBase = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", Buffer.from(secret, "hex"))
    .update(signatureBase)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function getAllowedPriceIds() {
  return (process.env.GHOST_ALLOWED_PRICE_IDS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);
}

function getGhostMemberPriceId(member: GhostMember) {
  const subscription = member.subscriptions?.[0];
  return (
    subscription?.price?.id ||
    subscription?.plan?.id ||
    null
  );
}

function isGhostMemberPaid(member: GhostMember, priceMatches: boolean) {
  const status = member.status?.toLowerCase() || "free";
  const hasActiveSubscription = (member.subscriptions || []).some(sub =>
    ["active", "trialing"].includes(sub.status || "")
  );

  const isPaidStatus = ["paid", "comped", "trialing"].includes(status) || hasActiveSubscription;
  return priceMatches && isPaidStatus;
}

async function fetchGhostMemberByEmail(email: string) {
  const apiUrl = process.env.GHOST_ADMIN_API_URL;
  const apiKey = process.env.GHOST_ADMIN_API_KEY;

  if (!apiUrl || !apiKey) {
    return null;
  }

  const token = createGhostAdminToken(apiKey);
  if (!token) {
    return null;
  }

  const baseUrl = apiUrl.replace(/\/$/, "");
  const filter = `email:'${email.replace(/'/g, "\\'")}'`;
  const url = `${baseUrl}/ghost/api/admin/members/?filter=${encodeURIComponent(filter)}&limit=1`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Ghost ${token}`,
      "Accept-Version": "v5.0",
    },
  });

  if (!response.ok) {
    console.error("Ghost admin lookup failed:", response.status, await response.text());
    return null;
  }

  const data = await response.json();
  const member = (data?.members || [])[0] as GhostMember | undefined;
  return member || null;
}

type ClaimResult = {
  status: number;
  body: { [key: string]: unknown };
};

function jsonNoStore(body: ClaimResult["body"], status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function handleMembershipClaim(): Promise<ClaimResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: 401, body: { error: "Unauthorized" } };
    }

    const email = user.email?.toLowerCase();
    if (!email) {
      return { status: 400, body: { error: "Missing email." } };
    }

    const admin = createAdminClient();
    const { data: existing, error: existingError } = await admin
      .from("bl_memberships")
      .select("is_paid")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      console.error("Membership lookup failed:", existingError);
      return { status: 500, body: { error: "Membership lookup failed." } };
    }

    if (existing?.is_paid) {
      return { status: 200, body: { claimed: false, isPaid: true } };
    }

    const { data: claim, error: claimError } = await admin
      .from("bl_membership_claims")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (claimError) {
      console.error("Membership claim lookup failed:", claimError);
      return { status: 500, body: { error: "Membership claim lookup failed." } };
    }

    const allowedPriceIds = getAllowedPriceIds();
    const ghostMember = !claim ? await fetchGhostMemberByEmail(email) : null;
    const ghostPriceId = ghostMember ? getGhostMemberPriceId(ghostMember) : null;
    const priceMatches = !allowedPriceIds.length || !ghostPriceId || allowedPriceIds.includes(ghostPriceId);
    const ghostPaid = ghostMember ? isGhostMemberPaid(ghostMember, priceMatches) : false;

    const membershipPayload = claim
      ? {
          user_id: user.id,
          is_paid: claim.is_paid || ghostPaid,
          status: claim.status,
          ghost_member_id: claim.ghost_member_id || ghostMember?.id || null,
          ghost_member_email: email,
          ghost_price_id: claim.ghost_price_id || ghostPriceId,
          ghost_last_event: claim.ghost_last_event || (ghostMember ? "ghost-admin-sync" : null),
          ghost_last_event_at: claim.ghost_last_event_at || (ghostMember ? new Date().toISOString() : null),
          updated_at: new Date().toISOString(),
        }
      : ghostMember
        ? {
            user_id: user.id,
            is_paid: ghostPaid,
            status: ghostMember.status || null,
            ghost_member_id: ghostMember.id || null,
            ghost_member_email: email,
            ghost_price_id: ghostPriceId,
            ghost_last_event: "ghost-admin-sync",
            ghost_last_event_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : null;

    if (!membershipPayload) {
      return { status: 200, body: { claimed: false, isPaid: false } };
    }

    const { error: upsertError } = await admin
      .from("bl_memberships")
      .upsert(membershipPayload, { onConflict: "user_id" });

    if (upsertError) {
      console.error("Membership claim upsert failed:", upsertError);
      return { status: 500, body: { error: "Failed to claim membership." } };
    }

    if (claim) {
      await admin.from("bl_membership_claims").delete().eq("email", email);
    }

    return { status: 200, body: { claimed: true, isPaid: membershipPayload.is_paid } };
  } catch (error) {
    console.error("Membership claim error:", error);
    return { status: 500, body: { error: "Membership claim error." } };
  }
}

export async function GET(_req: NextRequest) {
  const result = await handleMembershipClaim();
  return jsonNoStore(result.body, result.status);
}

export async function POST(_req: NextRequest) {
  const result = await handleMembershipClaim();
  return jsonNoStore(result.body, result.status);
}
