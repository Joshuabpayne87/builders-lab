import { NextRequest, NextResponse } from "next/server";
import { WorkshopService, CreateWorkshopParams, WorkshopFilters } from "@/lib/workshops-service";

/**
 * GET /api/workshops
 * Lists workshops with optional filtering
 *
 * Query params:
 * - status: active | archived
 * - includeArchived: true | false (for admin view)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: WorkshopFilters = {};

    const status = searchParams.get('status');
    if (status) filters.status = status as 'active' | 'archived';

    const includeArchived = searchParams.get('includeArchived');
    if (includeArchived === 'true') filters.includeArchived = true;

    const workshops = await WorkshopService.list(filters);

    return NextResponse.json({
      success: true,
      workshops,
      count: workshops.length
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/workshops error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

/**
 * POST /api/workshops
 * Creates a new workshop (admin only)
 *
 * Body: CreateWorkshopParams
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateWorkshopParams = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'title is required' },
        { status: 400 }
      );
    }

    if (!body.scheduled_at) {
      return NextResponse.json(
        { success: false, error: 'scheduled_at is required' },
        { status: 400 }
      );
    }

    if (!body.meeting_link) {
      return NextResponse.json(
        { success: false, error: 'meeting_link is required' },
        { status: 400 }
      );
    }

    const workshop = await WorkshopService.create(body);

    return NextResponse.json({
      success: true,
      workshop
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/workshops error:', error);

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
