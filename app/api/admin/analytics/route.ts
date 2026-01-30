import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "../_utils";

async function listAllUsers(admin: ReturnType<typeof createAdminClient>) {
  const users: Array<{
    created_at?: string | null;
    last_sign_in_at?: string | null;
  }> = [];
  let page = 1;
  const perPage = 200;
  const maxPages = 50;

  while (page <= maxPages) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    users.push(...(data.users || []));

    if (!data.nextPage || page >= data.lastPage) break;
    page = data.nextPage;
  }

  return users;
}

export async function GET() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.ok) return adminCheck.response;

  try {
    const admin = createAdminClient();
    const users = await listAllUsers(admin);

    const totalUsers = users.length;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlySignups = users.filter((user) =>
      user.created_at ? new Date(user.created_at) >= startOfMonth : false
    ).length;

    const activeUsers = users.filter((user) =>
      user.last_sign_in_at ? new Date(user.last_sign_in_at) >= startOfMonth : false
    ).length;

    const { count: totalContacts } = await admin
      .from("bl_crm_contacts")
      .select("id", { count: "exact", head: true });

    const { count: totalActivities } = await admin
      .from("bl_crm_activities")
      .select("id", { count: "exact", head: true });

    const { count: totalDeals } = await admin
      .from("bl_crm_deals")
      .select("id", { count: "exact", head: true });

    const { data: wonDeals } = await admin
      .from("bl_crm_deals")
      .select("value")
      .eq("status", "WON");

    const wonDealsCount = wonDeals?.length || 0;
    const totalRevenue = (wonDeals || []).reduce((sum, deal) => {
      const value = typeof deal.value === "number" ? deal.value : Number(deal.value) || 0;
      return sum + value;
    }, 0);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalRevenue,
      monthlySignups,
      totalContacts: totalContacts || 0,
      totalDeals: totalDeals || 0,
      totalActivities: totalActivities || 0,
      wonDeals: wonDealsCount,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { error: "Failed to load analytics." },
      { status: 500 }
    );
  }
}
