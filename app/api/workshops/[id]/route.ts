import { NextRequest, NextResponse } from "next/server";
import { WorkshopService, UpdateWorkshopParams } from "@/lib/workshops-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/workshops/[id]
 * Gets a single workshop by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const workshop = await WorkshopService.get(id);

    if (!workshop) {
      return NextResponse.json(
        { success: false, error: 'Workshop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      workshop
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/workshops/[id] error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workshops/[id]
 * Updates a workshop (admin only)
 *
 * Body: UpdateWorkshopParams
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: UpdateWorkshopParams = await request.json();

    const workshop = await WorkshopService.update(id, body);

    return NextResponse.json({
      success: true,
      workshop
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('PUT /api/workshops/[id] error:', error);

    if (message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (message.includes('Only admins')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workshops/[id]
 * Deletes a workshop permanently (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await WorkshopService.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Workshop deleted'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('DELETE /api/workshops/[id] error:', error);

    if (message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (message.includes('Only admins')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
