"use client";

import type { Loadout, CreateLoadoutParams, UpdateLoadoutParams, SlotConfig } from "./loadout-service";

/**
 * Client-side API wrappers for loadout management
 * These call the action-based server API route
 */

export async function getDefaultLoadout(): Promise<Loadout | null> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get_default' })
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch default loadout');
  }
  const data = await res.json();
  return data.loadout;
}

export async function listLoadouts(): Promise<Loadout[]> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list' })
  });
  if (!res.ok) throw new Error('Failed to fetch loadouts');
  const data = await res.json();
  return data.loadouts;
}

export async function getLoadout(id: string): Promise<Loadout | null> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', id })
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch loadout');
  }
  const data = await res.json();
  return data.loadout;
}

export async function createLoadout(params: CreateLoadoutParams): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', ...params })
  });
  if (!res.ok) throw new Error('Failed to create loadout');
  const data = await res.json();
  return data.loadout;
}

export async function updateLoadout(id: string, params: UpdateLoadoutParams): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', id, ...params })
  });
  if (!res.ok) throw new Error('Failed to update loadout');
  const data = await res.json();
  return data.loadout;
}

export async function deleteLoadout(id: string): Promise<void> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id })
  });
  if (!res.ok) throw new Error('Failed to delete loadout');
}

export async function setDefaultLoadout(id: string): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_default', id })
  });
  if (!res.ok) throw new Error('Failed to set default loadout');
  const data = await res.json();
  return data.loadout;
}

export async function equipPowerup(loadoutId: string, powerupId: string, slot: keyof SlotConfig): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'equip', loadout_id: loadoutId, powerup_id: powerupId, slot })
  });
  if (!res.ok) throw new Error('Failed to equip powerup');
  const data = await res.json();
  return data.loadout;
}

export async function unequipPowerup(loadoutId: string, slot: keyof SlotConfig, powerupId?: string): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'unequip', loadout_id: loadoutId, slot, powerup_id: powerupId })
  });
  if (!res.ok) throw new Error('Failed to unequip powerup');
  const data = await res.json();
  return data.loadout;
}

export async function clearAllPowerups(loadoutId: string): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'clear_all', loadout_id: loadoutId })
  });
  if (!res.ok) throw new Error('Failed to clear powerups');
  const data = await res.json();
  return data.loadout;
}

export async function duplicateLoadout(loadoutId: string, newName?: string): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'duplicate', loadout_id: loadoutId, new_name: newName })
  });
  if (!res.ok) throw new Error('Failed to duplicate loadout');
  const data = await res.json();
  return data.loadout;
}
