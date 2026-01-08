import { NextRequest, NextResponse } from "next/server";
import { PowerupService, CreatePowerupParams, PowerupFilters } from "@/lib/powerup-service";

/**
 * GET /api/powerups
 * Lists powerups with optional filtering
 *
 * Query params:
 * - type: SKILL | PERSONA | KNOWLEDGE
 * - category: marketing | development | research | copywriting | analysis | custom
 * - search: text search in name/description
 * - tags: comma-separated tag list
 * - is_active: true | false
 * - limit: number (default 100)
 * - offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build filters
    const filters: PowerupFilters = {};

    const type = searchParams.get('type');
    if (type) filters.type = type as any;

    const category = searchParams.get('category');
    if (category) filters.category = category as any;

    const search = searchParams.get('search');
    if (search) filters.search = search;

    const tags = searchParams.get('tags');
    if (tags) filters.tags = tags.split(',');

    const isActive = searchParams.get('is_active');
    if (isActive !== null) filters.is_active = isActive === 'true';

    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // List powerups
    const powerups = await PowerupService.list(filters, limit, offset);

    return NextResponse.json({
      success: true,
      powerups,
      count: powerups.length
    });
  } catch (error: any) {
    console.error('GET /api/powerups error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

/**
 * POST /api/powerups
 * Creates a new powerup (admin only)
 *
 * Body: CreatePowerupParams
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreatePowerupParams = await request.json();

    // Validate required fields
    if (!body.powerup_type) {
      return NextResponse.json(
        { success: false, error: 'powerup_type is required' },
        { status: 400 }
      );
    }

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'name is required' },
        { status: 400 }
      );
    }

    if (!body.content) {
      return NextResponse.json(
        { success: false, error: 'content is required' },
        { status: 400 }
      );
    }

    // Validate powerup type
    if (!['SKILL', 'PERSONA', 'KNOWLEDGE'].includes(body.powerup_type)) {
      return NextResponse.json(
        { success: false, error: 'powerup_type must be SKILL, PERSONA, or KNOWLEDGE' },
        { status: 400 }
      );
    }

    // Create powerup
    const powerup = await PowerupService.create(body);

    return NextResponse.json({
      success: true,
      powerup
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/powerups error:', error);

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
