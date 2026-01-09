"use client";

import type { Loadout, CreateLoadoutParams, UpdateLoadoutParams, SlotConfig } from "./loadout-service";

/**
 * Client-side API wrappers for loadout management
 * These call the server-side API routes
 */

export async function getDefaultLoadout(): Promise<Loadout | null> {
  const res = await fetch('/api/powerups/loadouts/default');
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch default loadout');
  }
  return res.json();
}

export async function listLoadouts(): Promise<Loadout[]> {
  const res = await fetch('/api/powerups/loadouts');
  if (!res.ok) throw new Error('Failed to fetch loadouts');
  return res.json();
}

export async function getLoadout(id: string): Promise<Loadout | null> {
  const res = await fetch(`/api/powerups/loadouts/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch loadout');
  }
  return res.json();
}

export async function createLoadout(params: CreateLoadoutParams): Promise<Loadout> {
  const res = await fetch('/api/powerups/loadouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to create loadout');
  return res.json();
}

export async function updateLoadout(id: string, params: UpdateLoadoutParams): Promise<Loadout> {
  const res = await fetch(`/api/powerups/loadouts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to update loadout');
  return res.json();
}

export async function deleteLoadout(id: string): Promise<void> {
  const res = await fetch(`/api/powerups/loadouts/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete loadout');
}

export async function setDefaultLoadout(id: string): Promise<Loadout> {
  const res = await fetch(`/api/powerups/loadouts/${id}/set-default`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to set default loadout');
  return res.json();
}

export async function equipPowerup(loadoutId: string, powerupId: string, slot: keyof SlotConfig): Promise<Loadout> {
  const res = await fetch(`/api/powerups/loadouts/${loadoutId}/equip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ powerupId, slot })
  });
  if (!res.ok) throw new Error('Failed to equip powerup');
  return res.json();
}

export async function unequipPowerup(loadoutId: string, slot: keyof SlotConfig, powerupId?: string): Promise<Loadout> {
  const res = await fetch(`/api/powerups/loadouts/${loadoutId}/unequip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slot, powerupId })
  });
  if (!res.ok) throw new Error('Failed to unequip powerup');
  return res.json();
}

export async function clearAllPowerups(loadoutId: string): Promise<Loadout> {
  const res = await fetch(`/api/powerups/loadouts/${loadoutId}/clear`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to clear powerups');
  return res.json();
}

export async function duplicateLoadout(loadoutId: string, newName?: string): Promise<Loadout> {
  const res = await fetch(`/api/powerups/loadouts/${loadoutId}/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newName })
  });
  if (!res.ok) throw new Error('Failed to duplicate loadout');
  return res.json();
}
