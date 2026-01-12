import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { updateFunnel, isSlugAvailable, generateSlug } from "@/app/apps/funnels/services/funnelService";
import type { DeployFunnelRequest, DeployFunnelResponse } from "@/app/apps/funnels/types";

export async function POST(req: Request) {
  try {
    const { funnelId, slug, htmlCode }: DeployFunnelRequest = await req.json();

    console.log('[DEPLOY] Starting deployment:', { funnelId, slug: slug || 'auto-generate', htmlCodeLength: htmlCode?.length });

    if (!funnelId || !htmlCode) {
      console.error('[DEPLOY] Missing required fields:', { funnelId: !!funnelId, htmlCode: !!htmlCode });
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
      console.error('[DEPLOY] Unauthorized - no user');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('[DEPLOY] User authenticated:', user.id);

    const { data: funnel, error: funnelError } = await supabase
      .from("bl_funnels_projects")
      .select("*")
      .eq("id", funnelId)
      .eq("user_id", user.id)
      .single();

    if (funnelError || !funnel) {
      console.error('[DEPLOY] Funnel not found:', { funnelId, error: funnelError });
      return NextResponse.json(
        { error: "Funnel not found" },
        { status: 404 }
      );
    }

    console.log('[DEPLOY] Funnel found:', { id: funnel.id, name: funnel.name });

    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = generateSlug(funnel.name);
      console.log('[DEPLOY] Generated slug:', finalSlug);
    }

    const available = await isSlugAvailable(finalSlug, funnelId);
    if (!available) {
      console.error('[DEPLOY] Slug not available:', finalSlug);
      return NextResponse.json(
        { error: "Slug already taken. Please choose another." },
        { status: 400 }
      );
    }

    console.log('[DEPLOY] Slug available:', finalSlug);

    const deployedHtml = htmlCode.replace(/__FUNNEL_ID__/g, funnelId);

    console.log('[DEPLOY] Updating funnel with slug and HTML...');

    const updatedFunnel = await updateFunnel(funnelId, {
      domain_slug: finalSlug,
      html_code: deployedHtml,
      status: "published",
    });

    console.log('[DEPLOY] Funnel updated successfully:', { id: updatedFunnel.id, slug: updatedFunnel.domain_slug });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const deployedUrl = `${appUrl}/f/${finalSlug}`;

    console.log('[DEPLOY] Deployment complete:', { deployedUrl, slug: finalSlug });

    const response: DeployFunnelResponse = {
      success: true,
      deployedUrl,
      slug: finalSlug,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[DEPLOY] Deployment error:", error);
    return NextResponse.json(
      { error: "Failed to deploy funnel", success: false },
      { status: 500 }
    );
  }
}
