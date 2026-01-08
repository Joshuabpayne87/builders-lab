import { NextRequest, NextResponse } from "next/server";
import { PowerupService, UpdatePowerupParams } from "@/lib/powerup-service";

/**
 * GET /api/powerups/[id]
 * Gets a single powerup by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const powerup = await PowerupService.get(id);

    if (!powerup) {
      return NextResponse.json(
        { success: false, error: 'Powerup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      powerup
    });
  } catch (error: any) {
    console.error('GET /api/powerups/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

/**
 * PUT /api/powerups/[id]
 * Updates a powerup (admin only)
 *
 * Body: UpdatePowerupParams
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdatePowerupParams = await request.json();

    // Update powerup
    const powerup = await PowerupService.update(id, body);

    return NextResponse.json({
      success: true,
      powerup
    });
  } catch (error: any) {
    console.error('PUT /api/powerups/[id] error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (error.message === 'Powerup not found') {
      return NextResponse.json(
        { success: false, error: 'Powerup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/powerups/[id]
 * Deletes a powerup (admin only)
 *
 * Query params:
 * - hard: true | false (default false, soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const hard = searchParams.get('hard') === 'true';

    await PowerupService.delete(id, hard);

    return NextResponse.json({
      success: true,
      message: hard ? 'Powerup permanently deleted' : 'Powerup deactivated'
    });
  } catch (error: any) {
    console.error('DELETE /api/powerups/[id] error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
