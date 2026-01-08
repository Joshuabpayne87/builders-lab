import { NextRequest, NextResponse } from "next/server";
import { LoadoutService, CreateLoadoutParams, UpdateLoadoutParams } from "@/lib/loadout-service";

/**
 * POST /api/powerups/loadouts
 * Action-based endpoint for loadout operations
 *
 * Actions:
 * - list: Get all loadouts for user
 * - get: Get single loadout by ID
 * - get_default: Get user's default loadout
 * - create: Create new loadout
 * - update: Update existing loadout
 * - delete: Delete loadout
 * - set_default: Set loadout as default
 * - equip: Equip powerup to slot
 * - unequip: Unequip powerup from slot
 * - clear_all: Clear all equipped powerups
 * - duplicate: Duplicate a loadout
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
      case 'list': {
        const loadouts = await LoadoutService.list();
        return NextResponse.json({ success: true, loadouts });
      }

      case 'get': {
        const { id } = body;
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'id is required' },
            { status: 400 }
          );
        }

        const loadout = await LoadoutService.get(id);
        if (!loadout) {
          return NextResponse.json(
            { success: false, error: 'Loadout not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({ success: true, loadout });
      }

      case 'get_default': {
        const loadout = await LoadoutService.getDefault();
        return NextResponse.json({ success: true, loadout });
      }

      case 'create': {
        const params: CreateLoadoutParams = {
          name: body.name,
          is_default: body.is_default,
          equipped_powerups: body.equipped_powerups,
          slot_config: body.slot_config
        };

        const loadout = await LoadoutService.create(params);
        return NextResponse.json({ success: true, loadout }, { status: 201 });
      }

      case 'update': {
        const { id, ...updateParams } = body;
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'id is required' },
            { status: 400 }
          );
        }

        const params: UpdateLoadoutParams = {
          name: updateParams.name,
          is_default: updateParams.is_default,
          equipped_powerups: updateParams.equipped_powerups,
          slot_config: updateParams.slot_config
        };

        const loadout = await LoadoutService.update(id, params);
        return NextResponse.json({ success: true, loadout });
      }

      case 'delete': {
        const { id } = body;
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'id is required' },
            { status: 400 }
          );
        }

        await LoadoutService.delete(id);
        return NextResponse.json({ success: true, message: 'Loadout deleted' });
      }

      case 'set_default': {
        const { id } = body;
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'id is required' },
            { status: 400 }
          );
        }

        const loadout = await LoadoutService.setDefault(id);
        return NextResponse.json({ success: true, loadout });
      }

      case 'equip': {
        const { loadout_id, powerup_id, slot } = body;
        if (!loadout_id || !powerup_id || !slot) {
          return NextResponse.json(
            { success: false, error: 'loadout_id, powerup_id, and slot are required' },
            { status: 400 }
          );
        }

        const loadout = await LoadoutService.equipPowerup(loadout_id, powerup_id, slot);
        return NextResponse.json({ success: true, loadout });
      }

      case 'unequip': {
        const { loadout_id, slot, powerup_id } = body;
        if (!loadout_id || !slot) {
          return NextResponse.json(
            { success: false, error: 'loadout_id and slot are required' },
            { status: 400 }
          );
        }

        const loadout = await LoadoutService.unequipPowerup(loadout_id, slot, powerup_id);
        return NextResponse.json({ success: true, loadout });
      }

      case 'clear_all': {
        const { loadout_id } = body;
        if (!loadout_id) {
          return NextResponse.json(
            { success: false, error: 'loadout_id is required' },
            { status: 400 }
          );
        }

        const loadout = await LoadoutService.clearAll(loadout_id);
        return NextResponse.json({ success: true, loadout });
      }

      case 'duplicate': {
        const { loadout_id, new_name } = body;
        if (!loadout_id) {
          return NextResponse.json(
            { success: false, error: 'loadout_id is required' },
            { status: 400 }
          );
        }

        const loadout = await LoadoutService.duplicate(loadout_id, new_name);
        return NextResponse.json({ success: true, loadout }, { status: 201 });
      }

      default: {
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
      }
    }
  } catch (error: any) {
    console.error('POST /api/powerups/loadouts error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.message === 'Loadout not found') {
      return NextResponse.json(
        { success: false, error: 'Loadout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
