import { NextRequest, NextResponse } from "next/server";
import { SessionOverrideService, CreateSessionOverrideParams, UpdateSessionOverrideParams } from "@/lib/session-override-service";

/**
 * POST /api/powerups/session
 * Action-based endpoint for session override operations
 *
 * Actions:
 * - get: Get session override by session_id
 * - set: Create/update session override
 * - update: Update existing session override
 * - delete: Delete session override
 * - equip: Equip powerup to slot
 * - unequip: Unequip powerup from slot
 * - clear_all: Clear all equipped powerups
 * - list: List all active sessions for user
 * - extend: Extend session expiry
 * - cleanup: Cleanup expired sessions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'action is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'get': {
        const { session_id } = body;
        if (!session_id) {
          return NextResponse.json(
            { success: false, error: 'session_id is required' },
            { status: 400 }
          );
        }

        const override = await SessionOverrideService.get(session_id);
        if (!override) {
          return NextResponse.json(
            { success: false, error: 'Session override not found or expired' },
            { status: 404 }
          );
        }

        return NextResponse.json({ success: true, override });
      }

      case 'set': {
        const { session_id, equipped_powerups, slot_config } = body;
        if (!session_id) {
          return NextResponse.json(
            { success: false, error: 'session_id is required' },
            { status: 400 }
          );
        }

        const params: CreateSessionOverrideParams = {
          session_id,
          equipped_powerups,
          slot_config
        };

        const override = await SessionOverrideService.set(params);
        return NextResponse.json({ success: true, override }, { status: 201 });
      }

      case 'update': {
        const { session_id, equipped_powerups, slot_config } = body;
        if (!session_id) {
          return NextResponse.json(
            { success: false, error: 'session_id is required' },
            { status: 400 }
          );
        }

        const params: UpdateSessionOverrideParams = {
          equipped_powerups,
          slot_config
        };

        const override = await SessionOverrideService.update(session_id, params);
        return NextResponse.json({ success: true, override });
      }

      case 'delete': {
        const { session_id } = body;
        if (!session_id) {
          return NextResponse.json(
            { success: false, error: 'session_id is required' },
            { status: 400 }
          );
        }

        await SessionOverrideService.delete(session_id);
        return NextResponse.json({ success: true, message: 'Session override deleted' });
      }

      case 'equip': {
        const { session_id, powerup_id, slot } = body;
        if (!session_id || !powerup_id || !slot) {
          return NextResponse.json(
            { success: false, error: 'session_id, powerup_id, and slot are required' },
            { status: 400 }
          );
        }

        const override = await SessionOverrideService.equipPowerup(session_id, powerup_id, slot);
        return NextResponse.json({ success: true, override });
      }

      case 'unequip': {
        const { session_id, slot, powerup_id } = body;
        if (!session_id || !slot) {
          return NextResponse.json(
            { success: false, error: 'session_id and slot are required' },
            { status: 400 }
          );
        }

        const override = await SessionOverrideService.unequipPowerup(session_id, slot, powerup_id);
        return NextResponse.json({ success: true, override });
      }

      case 'clear_all': {
        const { session_id } = body;
        if (!session_id) {
          return NextResponse.json(
            { success: false, error: 'session_id is required' },
            { status: 400 }
          );
        }

        const override = await SessionOverrideService.clearAll(session_id);
        return NextResponse.json({ success: true, override });
      }

      case 'list': {
        const overrides = await SessionOverrideService.listUserSessions();
        return NextResponse.json({ success: true, overrides });
      }

      case 'extend': {
        const { session_id } = body;
        if (!session_id) {
          return NextResponse.json(
            { success: false, error: 'session_id is required' },
            { status: 400 }
          );
        }

        const override = await SessionOverrideService.extendExpiry(session_id);
        return NextResponse.json({ success: true, override });
      }

      case 'cleanup': {
        const count = await SessionOverrideService.cleanupExpired();
        return NextResponse.json({
          success: true,
          message: `Cleaned up ${count} expired sessions`
        });
      }

      default: {
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
      }
    }
  } catch (error: any) {
    console.error('POST /api/powerups/session error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
