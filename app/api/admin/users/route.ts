import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "../_utils";

async function listAllUsers(admin: ReturnType<typeof createAdminClient>) {
  const users: any[] = [];
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
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Failed to load users." }, { status: 500 });
  }
}
