import { NextRequest, NextResponse } from "next/server";
import { PreferenceService } from "@/lib/preference-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...params } = body;

    if (action === 'record') {
      await PreferenceService.recordPreference(
        params.appName,
        params.selectionType,
        params.value
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'analyze') {
      const preferences = await PreferenceService.analyzePreferences(params.appName);
      return NextResponse.json({ preferences });
    }

    if (action === 'getRecommendedVibe') {
      const vibe = await PreferenceService.getRecommendedVibe(params.appName);
      return NextResponse.json({ vibe });
    }

    if (action === 'getContext') {
      const context = await PreferenceService.getPreferenceContext(params.appName);
      return NextResponse.json({ context });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Preferences API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
