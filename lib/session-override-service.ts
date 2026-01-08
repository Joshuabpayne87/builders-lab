import { createClient } from "@/lib/supabase/server";
import { SlotConfig } from "./loadout-service";

export interface SessionOverride {
  session_id: string;
  user_id: string;
  equipped_powerups: string[];
  slot_config: SlotConfig;
  created_at: string;
  expires_at: string;
}

export interface CreateSessionOverrideParams {
  session_id: string;
  equipped_powerups?: string[];
  slot_config?: SlotConfig;
}

export interface UpdateSessionOverrideParams {
  equipped_powerups?: string[];
  slot_config?: SlotConfig;
}

/**
 * Server-side service for managing temporary session-based powerup configurations
 * Session overrides expire after 24 hours and take precedence over default loadouts
 */
export class SessionOverrideService {
  /**
   * Creates or replaces a session override for the current user
   * Session overrides are temporary and expire after 24 hours
   */
  static async set(params: CreateSessionOverrideParams): Promise<SessionOverride> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Upsert (insert or update if exists)
    const { data, error } = await supabase
      .from('bl_ai_session_overrides')
      .upsert({
        session_id: params.session_id,
        user_id: user.id,
        equipped_powerups: params.equipped_powerups || [],
        slot_config: params.slot_config || {}
      }, {
        onConflict: 'session_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data as SessionOverride;
  }

  /**
   * Gets a session override by session ID
   * Returns null if not found or expired
   */
  static async get(sessionId: string): Promise<SessionOverride | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('bl_ai_session_overrides')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString()) // Not expired
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as SessionOverride;
  }

  /**
   * Updates an existing session override
   */
  static async update(sessionId: string, params: UpdateSessionOverrideParams): Promise<SessionOverride> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Extend expiry by 24 hours on update
    const updateData = {
      ...params,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    const { data, error } = await supabase
      .from('bl_ai_session_overrides')
      .update(updateData)
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as SessionOverride;
  }

  /**
   * Deletes a session override
   */
  static async delete(sessionId: string): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
      .from('bl_ai_session_overrides')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  /**
   * Equips a powerup to a specific slot in session override
   */
  static async equipPowerup(
    sessionId: string,
    powerupId: string,
    slot: keyof SlotConfig
  ): Promise<SessionOverride> {
    const override = await this.get(sessionId);

    // If no override exists, create one
    if (!override) {
      const slotConfig: SlotConfig = {};
      if (slot === 'brain') {
        slotConfig.brain = [powerupId];
      } else {
        slotConfig[slot] = powerupId;
      }

      return this.set({
        session_id: sessionId,
        equipped_powerups: [powerupId],
        slot_config: slotConfig
      });
    }

    const slotConfig = { ...override.slot_config };
    const equippedPowerups = [...override.equipped_powerups];

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
          if (key === slot) return false;
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

    return this.update(sessionId, {
      equipped_powerups: equippedPowerups,
      slot_config: slotConfig
    });
  }

  /**
   * Unequips a powerup from a specific slot in session override
   */
  static async unequipPowerup(
    sessionId: string,
    slot: keyof SlotConfig,
    powerupId?: string
  ): Promise<SessionOverride | null> {
    const override = await this.get(sessionId);
    if (!override) return null;

    const slotConfig = { ...override.slot_config };
    const equippedPowerups = [...override.equipped_powerups];

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

    return this.update(sessionId, {
      equipped_powerups: equippedPowerups,
      slot_config: slotConfig
    });
  }

  /**
   * Clears all equipped powerups from a session override
   */
  static async clearAll(sessionId: string): Promise<SessionOverride> {
    return this.update(sessionId, {
      equipped_powerups: [],
      slot_config: {}
    });
  }

  /**
   * Cleans up expired session overrides
   * Should be called periodically (e.g., via cron job)
   */
  static async cleanupExpired(): Promise<number> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('bl_ai_session_overrides')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('session_id');

    if (error) throw error;
    return data?.length || 0;
  }

  /**
   * Gets all active session overrides for the current user
   * Useful for debugging
   */
  static async listUserSessions(): Promise<SessionOverride[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('bl_ai_session_overrides')
      .select('*')
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as SessionOverride[];
  }

  /**
   * Extends the expiry of a session override by 24 hours
   */
  static async extendExpiry(sessionId: string): Promise<SessionOverride> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('bl_ai_session_overrides')
      .update({ expires_at: newExpiry })
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as SessionOverride;
  }
}
