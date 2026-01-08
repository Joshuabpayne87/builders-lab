import { AppName, SaveSessionParams, Session } from "./session-service";

/**
 * Client-side helpers for interacting with the sessions API.
 * These functions are used from React components to manage user sessions.
 */

/**
 * Saves a new session
 */
export async function saveSession(
  params: SaveSessionParams
): Promise<{ success: boolean; session: Session }> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "save",
      ...params,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save session");
  }

  return response.json();
}

/**
 * Lists sessions for an app with optional pagination
 */
export async function listSessions(
  appName: AppName,
  limit: number = 50,
  offset: number = 0
): Promise<Session[]> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "list",
      appName,
      limit,
      offset,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch sessions");
  }

  const { sessions } = await response.json();
  return sessions;
}

/**
 * Lists recent sessions across ALL apps
 */
export async function listAllSessions(
  limit: number = 10
): Promise<Session[]> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "listAll",
      limit,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch recent sessions");
  }

  const { sessions } = await response.json();
  return sessions;
}

/**
 * Gets a single session by ID
 */
export async function getSession(id: string): Promise<Session | null> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "get",
      id,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch session");
  }

  const { session } = await response.json();
  return session;
}

/**
 * Updates an existing session
 */
export async function updateSession(
  id: string,
  title?: string,
  data?: Record<string, any>,
  metadata?: Record<string, any>
): Promise<{ success: boolean; session: Session }> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "update",
      id,
      title,
      data,
      metadata,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update session");
  }

  return response.json();
}

/**
 * Deletes a session
 */
export async function deleteSession(id: string): Promise<{ success: boolean }> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "delete",
      id,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete session");
  }

  return response.json();
}

/**
 * Counts total sessions for an app
 */
export async function countSessions(appName: AppName): Promise<number> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "count",
      appName,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to count sessions");
  }

  const { count } = await response.json();
  return count;
}
