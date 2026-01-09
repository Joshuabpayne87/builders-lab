import { NextResponse } from "next/server";
import { LoadoutService } from "@/lib/loadout-service";

/**
 * GET /api/powerups/loadouts/default
 * Get the user's default loadout
 */
export async function GET() {
  try {
    const loadout = await LoadoutService.getDefault();
    return NextResponse.json(loadout);
  } catch (error: any) {
    console.error('GET /api/powerups/loadouts/default error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
