import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { funnelId } = body;

    if (!funnelId) {
      return NextResponse.json(
        { error: "Missing funnel ID" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify funnel belongs to user
    const { data: funnel } = await supabase
      .from("bl_funnels_projects")
      .select("id, user_id")
      .eq("id", funnelId)
      .single();

    if (!funnel || funnel.user_id !== user.id) {
      return NextResponse.json(
        { error: "Funnel not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete all associated leads first
    await supabase
      .from("bl_funnels_leads")
      .delete()
      .eq("funnel_id", funnelId);

    // Delete the funnel
    const { error } = await supabase
      .from("bl_funnels_projects")
      .delete()
      .eq("id", funnelId);

    if (error) {
      console.error("Failed to delete funnel:", error);
      return NextResponse.json(
        { error: "Failed to delete funnel" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Funnel deleted successfully",
    });
  } catch (error) {
    console.error("Delete funnel error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
