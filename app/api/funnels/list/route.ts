import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all funnels for this user
    const { data: funnels, error } = await supabase
      .from("bl_funnels_projects")
      .select(`
        id,
        name,
        domain_slug,
        status,
        created_at,
        html_code,
        view_count,
        submission_count,
        deployed_url
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch funnels:", error);
      return NextResponse.json(
        { error: "Failed to fetch funnels" },
        { status: 500 }
      );
    }

    // Get submission counts for each funnel
    const funnelsWithStats = await Promise.all(
      (funnels || []).map(async (funnel) => {
        const { count } = await supabase
          .from("bl_funnels_leads")
          .select("*", { count: "exact", head: true })
          .eq("funnel_id", funnel.id);

        return {
          ...funnel,
          lead_count: count || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      funnels: funnelsWithStats,
    });
  } catch (error) {
    console.error("List funnels error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
