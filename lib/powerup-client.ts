/**
 * Client-side helper functions for interacting with the powerup API
 * These functions can be called from React components
 */

import { Powerup, PowerupType, PowerupCategory, PowerupFilters, CreatePowerupParams, UpdatePowerupParams } from "./powerup-service";
import { Loadout, SlotConfig, CreateLoadoutParams, UpdateLoadoutParams } from "./loadout-service";
import { SessionOverride, CreateSessionOverrideParams, UpdateSessionOverrideParams } from "./session-override-service";

// ============================================================================
// Powerups API
// ============================================================================

export interface ListPowerupsParams {
  type?: PowerupType;
  category?: PowerupCategory;
  search?: string;
  tags?: string[];
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export async function listPowerups(params?: ListPowerupsParams): Promise<Powerup[]> {
  const searchParams = new URLSearchParams();

  if (params?.type) searchParams.set('type', params.type);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.tags) searchParams.set('tags', params.tags.join(','));
  if (params?.is_active !== undefined) searchParams.set('is_active', params.is_active.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const res = await fetch(`/api/powerups?${searchParams.toString()}`);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Failed to list powerups');
  return data.powerups;
}

export async function getPowerup(id: string): Promise<Powerup> {
  const res = await fetch(`/api/powerups/${id}`);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Failed to get powerup');
  return data.powerup;
}

export async function getManyPowerups(ids: string[]): Promise<Powerup[]> {
  if (ids.length === 0) return [];

  // Fetch multiple powerups
  const promises = ids.map(id => getPowerup(id).catch(err => {
    console.error(`Failed to fetch powerup ${id}:`, err);
    return null;
  }));

  const results = await Promise.all(promises);
  return results.filter((p): p is Powerup => p !== null);
}

export async function createPowerup(params: CreatePowerupParams): Promise<Powerup> {
  const res = await fetch('/api/powerups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create powerup');
  return data.powerup;
}

export async function updatePowerup(id: string, params: UpdatePowerupParams): Promise<Powerup> {
  const res = await fetch(`/api/powerups/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update powerup');
  return data.powerup;
}

export async function deletePowerup(id: string, hard = false): Promise<void> {
  const res = await fetch(`/api/powerups/${id}?hard=${hard}`, {
    method: 'DELETE'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete powerup');
}

// ============================================================================
// Loadouts API
// ============================================================================

export async function listLoadouts(): Promise<Loadout[]> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list' })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to list loadouts');
  return data.loadouts;
}

export async function getLoadout(id: string): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', id })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get loadout');
  return data.loadout;
}

export async function getDefaultLoadout(): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get_default' })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get default loadout');
  return data.loadout;
}

export async function createLoadout(params: CreateLoadoutParams): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', ...params })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create loadout');
  return data.loadout;
}

export async function updateLoadout(id: string, params: UpdateLoadoutParams): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', id, ...params })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update loadout');
  return data.loadout;
}

export async function deleteLoadout(id: string): Promise<void> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete loadout');
}

export async function setDefaultLoadout(id: string): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_default', id })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to set default loadout');
  return data.loadout;
}

export async function equipPowerupToLoadout(
  loadoutId: string,
  powerupId: string,
  slot: keyof SlotConfig
): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'equip',
      loadout_id: loadoutId,
      powerup_id: powerupId,
      slot
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to equip powerup');
  return data.loadout;
}

export async function unequipPowerupFromLoadout(
  loadoutId: string,
  slot: keyof SlotConfig,
  powerupId?: string
): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'unequip',
      loadout_id: loadoutId,
      slot,
      powerup_id: powerupId
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to unequip powerup');
  return data.loadout;
}

export async function clearAllLoadout(loadoutId: string): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'clear_all', loadout_id: loadoutId })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to clear loadout');
  return data.loadout;
}

export async function duplicateLoadout(loadoutId: string, newName?: string): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'duplicate',
      loadout_id: loadoutId,
      new_name: newName
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to duplicate loadout');
  return data.loadout;
}

// ============================================================================
// Session Overrides API
// ============================================================================

export async function getSessionOverride(sessionId: string): Promise<SessionOverride | null> {
  const res = await fetch('/api/powerups/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', session_id: sessionId })
  });

  const data = await res.json();
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(data.error || 'Failed to get session override');
  return data.override;
}

export async function setSessionOverride(params: CreateSessionOverrideParams): Promise<SessionOverride> {
  const res = await fetch('/api/powerups/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set', ...params })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to set session override');
  return data.override;
}

export async function updateSessionOverride(
  sessionId: string,
  params: UpdateSessionOverrideParams
): Promise<SessionOverride> {
  const res = await fetch('/api/powerups/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', session_id: sessionId, ...params })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update session override');
  return data.override;
}

export async function deleteSessionOverride(sessionId: string): Promise<void> {
  const res = await fetch('/api/powerups/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', session_id: sessionId })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete session override');
}

export async function equipPowerupToSession(
  sessionId: string,
  powerupId: string,
  slot: keyof SlotConfig
): Promise<SessionOverride> {
  const res = await fetch('/api/powerups/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'equip',
      session_id: sessionId,
      powerup_id: powerupId,
      slot
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to equip powerup to session');
  return data.override;
}

export async function unequipPowerupFromSession(
  sessionId: string,
  slot: keyof SlotConfig,
  powerupId?: string
): Promise<SessionOverride | null> {
  const res = await fetch('/api/powerups/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'unequip',
      session_id: sessionId,
      slot,
      powerup_id: powerupId
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to unequip powerup from session');
  return data.override;
}

export async function clearAllSession(sessionId: string): Promise<SessionOverride> {
  const res = await fetch('/api/powerups/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'clear_all', session_id: sessionId })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to clear session');
  return data.override;
}

export async function listUserSessions(): Promise<SessionOverride[]> {
  const res = await fetch('/api/powerups/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list' })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to list sessions');
  return data.overrides;
}

export async function extendSessionExpiry(sessionId: string): Promise<SessionOverride> {
  const res = await fetch('/api/powerups/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'extend', session_id: sessionId })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to extend session');
  return data.override;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generates or retrieves a session ID from sessionStorage
 * Call this on the powerups page to maintain session state
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  const key = 'powerup_session_id';
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

/**
 * Clears the session ID from sessionStorage
 * Call this on reset
 */
export function clearSessionId(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('powerup_session_id');
}
