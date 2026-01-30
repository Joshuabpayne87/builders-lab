import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "../_utils";

const ALLOWED_TABLES = new Set([
  "bl_crm_contacts",
  "bl_crm_activities",
  "bl_crm_deals",
  "bl_crm_ai_automations",
]);

export async function GET(request: Request) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.ok) return adminCheck.response;

  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table") || "";
  const limit = Math.min(Number(searchParams.get("limit")) || 100, 500);

  if (!ALLOWED_TABLES.has(table)) {
    return NextResponse.json(
      { error: "Invalid table selection." },
      { status: 400 }
    );
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from(table).select("*").limit(limit);

    if (error) throw error;
    return NextResponse.json({ rows: data || [] });
  } catch (error) {
    console.error("Admin database error:", error);
    return NextResponse.json(
      { error: "Failed to load table data." },
      { status: 500 }
    );
  }
}
