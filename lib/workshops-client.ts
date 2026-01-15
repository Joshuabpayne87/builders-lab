/**
 * Client-side helper functions for interacting with the workshops API
 */

import { Workshop, CreateWorkshopParams, UpdateWorkshopParams, WorkshopStatus } from "./workshops-service";

export interface ListWorkshopsParams {
  status?: WorkshopStatus;
  includeArchived?: boolean;
}

/**
 * Lists workshops with optional filters
 */
export async function listWorkshops(params?: ListWorkshopsParams): Promise<Workshop[]> {
  const searchParams = new URLSearchParams();

  if (params?.status) searchParams.set('status', params.status);
  if (params?.includeArchived) searchParams.set('includeArchived', 'true');

  const res = await fetch(`/api/workshops?${searchParams.toString()}`);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Failed to list workshops');
  return data.workshops;
}

/**
 * Gets the next upcoming active workshop
 */
export async function getNextWorkshop(): Promise<Workshop | null> {
  const res = await fetch('/api/workshops/next');
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Failed to get next workshop');
  return data.workshop;
}

/**
 * Gets a single workshop by ID
 */
export async function getWorkshop(id: string): Promise<Workshop> {
  const res = await fetch(`/api/workshops/${id}`);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Failed to get workshop');
  return data.workshop;
}

/**
 * Creates a new workshop (admin only)
 */
export async function createWorkshop(params: CreateWorkshopParams): Promise<Workshop> {
  const res = await fetch('/api/workshops', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create workshop');
  return data.workshop;
}

/**
 * Updates a workshop (admin only)
 */
export async function updateWorkshop(id: string, params: UpdateWorkshopParams): Promise<Workshop> {
  const res = await fetch(`/api/workshops/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update workshop');
  return data.workshop;
}

/**
 * Archives a workshop (admin only)
 */
export async function archiveWorkshop(id: string): Promise<Workshop> {
  return updateWorkshop(id, { status: 'archived' });
}

/**
 * Restores an archived workshop (admin only)
 */
export async function restoreWorkshop(id: string): Promise<Workshop> {
  return updateWorkshop(id, { status: 'active' });
}

/**
 * Deletes a workshop permanently (admin only)
 */
export async function deleteWorkshop(id: string): Promise<void> {
  const res = await fetch(`/api/workshops/${id}`, {
    method: 'DELETE'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete workshop');
}
