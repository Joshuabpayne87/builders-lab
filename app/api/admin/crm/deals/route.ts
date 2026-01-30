import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "../../_utils";

export async function GET(request: Request) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.ok) return adminCheck.response;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 200, 1000);

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("bl_crm_deals")
      .select("*, contact:bl_crm_contacts(name, email, company)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json({ deals: data || [] });
  } catch (error) {
    console.error("Admin deals error:", error);
    return NextResponse.json({ error: "Failed to load deals." }, { status: 500 });
  }
}
