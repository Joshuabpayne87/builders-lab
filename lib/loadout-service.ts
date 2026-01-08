import { createClient } from "@/lib/supabase/server";

export interface SlotConfig {
  marketing?: string;
  copywriter?: string;
  researcher?: string;
  developer?: string;
  analyst?: string;
  custom?: string;
  brain?: string[]; // Knowledge files (array)
}

export interface Loadout {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  equipped_powerups: string[];
  slot_config: SlotConfig;
  created_at: string;
  updated_at: string;
}

export interface CreateLoadoutParams {
  name?: string;
  is_default?: boolean;
  equipped_powerups?: string[];
  slot_config?: SlotConfig;
}

export interface UpdateLoadoutParams {
  name?: string;
  is_default?: boolean;
  equipped_powerups?: string[];
  slot_config?: SlotConfig;
}

/**
 * Server-side service for managing user powerup loadouts (saved configurations)
 */
export class LoadoutService {
  /**
   * Creates a new loadout for the current user
   */
  static async create(params: CreateLoadoutParams): Promise<Loadout> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // If setting as default, unset other defaults first
    if (params.is_default) {
      await supabase
        .from('bl_ai_loadouts')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('bl_ai_loadouts')
      .insert({
        user_id: user.id,
        name: params.name || 'Default Loadout',
        is_default: params.is_default ?? true,
        equipped_powerups: params.equipped_powerups || [],
        slot_config: params.slot_config || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data as Loadout;
  }

  /**
   * Lists all loadouts for the current user
   */
  static async list(): Promise<Loadout[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('bl_ai_loadouts')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false }) // Default first
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Loadout[];
  }

  /**
   * Gets a single loadout by ID
   */
  static async get(id: string): Promise<Loadout | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('bl_ai_loadouts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as Loadout;
  }

  /**
   * Gets the user's default loadout
   * Creates one if it doesn't exist
   */
  static async getDefault(): Promise<Loadout> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Try to get existing default
    const { data, error } = await supabase
      .from('bl_ai_loadouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single();

    if (data) {
      return data as Loadout;
    }

    // If no default exists, create one
    return this.create({
      name: 'Default Loadout',
      is_default: true,
      equipped_powerups: [],
      slot_config: {}
    });
  }

  /**
   * Updates a loadout
   */
  static async update(id: string, params: UpdateLoadoutParams): Promise<Loadout> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // If setting as default, unset other defaults first
    if (params.is_default) {
      await supabase
        .from('bl_ai_loadouts')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
        .neq('id', id); // Don't unset the one we're updating
    }

    const { data, error } = await supabase
      .from('bl_ai_loadouts')
      .update(params)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as Loadout;
  }

  /**
   * Deletes a loadout
   * Cannot delete the default loadout unless another default is set
   */
  static async delete(id: string): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Check if this is the default loadout
    const loadout = await this.get(id);
    if (!loadout) throw new Error("Loadout not found");

    if (loadout.is_default) {
      // Count total loadouts
      const { count } = await supabase
        .from('bl_ai_loadouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (count && count <= 1) {
        throw new Error("Cannot delete the only loadout. Create another one first.");
      }

      // Set another loadout as default
      const allLoadouts = await this.list();
      const otherLoadout = allLoadouts.find(l => l.id !== id);
      if (otherLoadout) {
        await this.update(otherLoadout.id, { is_default: true });
      }
    }

    const { error } = await supabase
      .from('bl_ai_loadouts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  /**
   * Sets a loadout as the default
   */
  static async setDefault(id: string): Promise<Loadout> {
    return this.update(id, { is_default: true });
  }

  /**
   * Equips a powerup to a specific slot
   */
  static async equipPowerup(loadoutId: string, powerupId: string, slot: keyof SlotConfig): Promise<Loadout> {
    const loadout = await this.get(loadoutId);
    if (!loadout) throw new Error("Loadout not found");

    const slotConfig = { ...loadout.slot_config };
    const equippedPowerups = [...loadout.equipped_powerups];

    // Add to equipped list if not already there
    if (!equippedPowerups.includes(powerupId)) {
      equippedPowerups.push(powerupId);
    }

    // Handle brain slot (array of knowledge files)
    if (slot === 'brain') {
      const brainSlot = (slotConfig.brain || []) as string[];
      if (!brainSlot.includes(powerupId)) {
        brainSlot.push(powerupId);
        slotConfig.brain = brainSlot;
      }
    } else {
      // Regular slots (single powerup)
      // If slot was occupied, remove old powerup from equipped list if not used elsewhere
      const oldPowerupId = slotConfig[slot];
      if (oldPowerupId) {
        const stillUsed = Object.entries(slotConfig).some(([key, val]) => {
          if (key === slot) return false; // Skip the slot we're updating
          if (key === 'brain') return (val as string[]).includes(oldPowerupId);
          return val === oldPowerupId;
        });
        if (!stillUsed) {
          const index = equippedPowerups.indexOf(oldPowerupId);
          if (index > -1) equippedPowerups.splice(index, 1);
        }
      }

      slotConfig[slot] = powerupId;
    }

    return this.update(loadoutId, {
      equipped_powerups: equippedPowerups,
      slot_config: slotConfig
    });
  }

  /**
   * Unequips a powerup from a specific slot
   */
  static async unequipPowerup(loadoutId: string, slot: keyof SlotConfig, powerupId?: string): Promise<Loadout> {
    const loadout = await this.get(loadoutId);
    if (!loadout) throw new Error("Loadout not found");

    const slotConfig = { ...loadout.slot_config };
    const equippedPowerups = [...loadout.equipped_powerups];

    if (slot === 'brain' && powerupId) {
      // Remove specific file from brain
      const brainSlot = (slotConfig.brain || []) as string[];
      const index = brainSlot.indexOf(powerupId);
      if (index > -1) {
        brainSlot.splice(index, 1);
        slotConfig.brain = brainSlot;

        // Remove from equipped if not used elsewhere
        const stillUsed = Object.entries(slotConfig).some(([key, val]) => {
          if (key === 'brain') return brainSlot.includes(powerupId);
          return val === powerupId;
        });
        if (!stillUsed) {
          const eqIndex = equippedPowerups.indexOf(powerupId);
          if (eqIndex > -1) equippedPowerups.splice(eqIndex, 1);
        }
      }
    } else {
      // Clear regular slot
      const oldPowerupId = slotConfig[slot];
      if (oldPowerupId) {
        delete slotConfig[slot];

        // Remove from equipped if not used elsewhere
        const stillUsed = Object.entries(slotConfig).some(([key, val]) => {
          if (key === 'brain') return (val as string[]).includes(oldPowerupId);
          return val === oldPowerupId;
        });
        if (!stillUsed) {
          const index = equippedPowerups.indexOf(oldPowerupId);
          if (index > -1) equippedPowerups.splice(index, 1);
        }
      }
    }

    return this.update(loadoutId, {
      equipped_powerups: equippedPowerups,
      slot_config: slotConfig
    });
  }

  /**
   * Clears all equipped powerups from a loadout
   */
  static async clearAll(loadoutId: string): Promise<Loadout> {
    return this.update(loadoutId, {
      equipped_powerups: [],
      slot_config: {}
    });
  }

  /**
   * Duplicates a loadout
   */
  static async duplicate(loadoutId: string, newName?: string): Promise<Loadout> {
    const loadout = await this.get(loadoutId);
    if (!loadout) throw new Error("Loadout not found");

    return this.create({
      name: newName || `${loadout.name} (Copy)`,
      is_default: false,
      equipped_powerups: loadout.equipped_powerups,
      slot_config: loadout.slot_config
    });
  }
}
