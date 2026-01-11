import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API endpoint to trigger real-time theme updates
 * Called after a theme is saved to notify connected clients
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { theme } = body;

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme data required' },
        { status: 400 }
      );
    }

    // The theme is already saved to the database by the client
    // This endpoint just confirms the update was successful
    // Real-time updates happen automatically via Supabase realtime

    return NextResponse.json({
      success: true,
      message: 'Theme update notification sent',
      user_id: user.id
    });

  } catch (error: any) {
    console.error('Theme update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update theme' },
      { status: 500 }
    );
  }
}
