import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { updateFunnel, isSlugAvailable, generateSlug } from "@/app/apps/funnels/services/funnelService";
import type { DeployFunnelRequest, DeployFunnelResponse } from "@/app/apps/funnels/types";

export async function POST(req: Request) {
  try {
    const { funnelId, slug, htmlCode }: DeployFunnelRequest = await req.json();

    if (!funnelId || !htmlCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: funnel, error: funnelError } = await supabase
      .from("bl_funnels_projects")
      .select("*")
      .eq("id", funnelId)
      .eq("user_id", user.id)
      .single();

    if (funnelError || !funnel) {
      return NextResponse.json(
        { error: "Funnel not found" },
        { status: 404 }
      );
    }

    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = generateSlug(funnel.name);
    }

    const available = await isSlugAvailable(finalSlug, funnelId);
    if (!available) {
      return NextResponse.json(
        { error: "Slug already taken. Please choose another." },
        { status: 400 }
      );
    }

    const deployedHtml = htmlCode.replace(/__FUNNEL_ID__/g, funnelId);

    const updatedFunnel = await updateFunnel(funnelId, {
      domain_slug: finalSlug,
      html_code: deployedHtml,
      status: "published",
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const deployedUrl = `${appUrl}/f/${finalSlug}`;

    const response: DeployFunnelResponse = {
      success: true,
      deployedUrl,
      slug: finalSlug,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Deployment error:", error);
    return NextResponse.json(
      { error: "Failed to deploy funnel", success: false },
      { status: 500 }
    );
  }
}
