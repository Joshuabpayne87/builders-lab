import { NextResponse } from "next/server";
import { WorkshopService } from "@/lib/workshops-service";

/**
 * GET /api/workshops/next
 * Gets the next upcoming active workshop
 */
export async function GET() {
  try {
    const workshop = await WorkshopService.getNextUpcoming();

    return NextResponse.json({
      success: true,
      workshop
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/workshops/next error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
