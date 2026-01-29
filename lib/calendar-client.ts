import type {
  CalendarTask,
  CreateTaskParams,
  UpdateTaskParams,
  TaskStatus,
  UpcomingTask,
  IncompleteTask,
} from "./calendar-service";

async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Create a new calendar task
 */
export async function createTask(params: CreateTaskParams): Promise<{ success: boolean; task: CalendarTask }> {
  const response = await fetch("/api/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create", ...params }),
  });

  const data = await readJson<{ error?: string; success?: boolean; task?: CalendarTask }>(response);
  if (!response.ok) {
    throw new Error(data?.error || `Failed to create task (${response.status})`);
  }
  if (!data?.task) {
    throw new Error("Failed to create task (empty response)");
  }
  return { success: true, task: data.task };
}

/**
 * List calendar tasks with optional filters
 */
export async function listTasks(
  status?: TaskStatus,
  startDate?: string,
  endDate?: string,
  limit: number = 100,
  offset: number = 0
): Promise<CalendarTask[]> {
  const response = await fetch("/api/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "list",
      status,
      startDate,
      endDate,
      limit,
      offset,
    }),
  });

  const data = await readJson<{ error?: string; tasks?: CalendarTask[] }>(response);
  if (!response.ok) {
    throw new Error(data?.error || `Failed to list tasks (${response.status})`);
  }
  return data?.tasks || [];
}

/**
 * Get a single task by ID
 */
export async function getTask(id: string): Promise<CalendarTask | null> {
  const response = await fetch("/api/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "get", id }),
  });

  const data = await readJson<{ error?: string; task?: CalendarTask | null }>(response);
  if (!response.ok) {
    throw new Error(data?.error || `Failed to get task (${response.status})`);
  }
  return data?.task ?? null;
}

/**
 * Update an existing task
 */
export async function updateTask(
  id: string,
  params: UpdateTaskParams
): Promise<{ success: boolean; task: CalendarTask }> {
  const response = await fetch("/api/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update", id, ...params }),
  });

  const data = await readJson<{ error?: string; success?: boolean; task?: CalendarTask }>(response);
  if (!response.ok) {
    throw new Error(data?.error || `Failed to update task (${response.status})`);
  }
  if (!data?.task) {
    throw new Error("Failed to update task (empty response)");
  }
  return { success: true, task: data.task };
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<{ success: boolean }> {
  const response = await fetch("/api/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", id }),
  });

  const data = await readJson<{ error?: string; success?: boolean }>(response);
  if (!response.ok) {
    throw new Error(data?.error || `Failed to delete task (${response.status})`);
  }
  return { success: true };
}

/**
 * Get upcoming tasks (for notifications and reminders)
 */
export async function getUpcomingTasks(hoursAhead: number = 24): Promise<UpcomingTask[]> {
  const response = await fetch("/api/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "getUpcoming", hoursAhead }),
  });

  const data = await readJson<{ error?: string; tasks?: UpcomingTask[] }>(response);
  if (!response.ok) {
    throw new Error(data?.error || `Failed to get upcoming tasks (${response.status})`);
  }
  return data?.tasks || [];
}

/**
 * Get incomplete tasks (past due without linked content)
 */
export async function getIncompleteTasks(): Promise<IncompleteTask[]> {
  const response = await fetch("/api/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "getIncomplete" }),
  });

  const data = await readJson<{ error?: string; tasks?: IncompleteTask[] }>(response);
  if (!response.ok) {
    throw new Error(data?.error || `Failed to get incomplete tasks (${response.status})`);
  }
  return data?.tasks || [];
}

/**
 * Get task statistics
 */
export async function getTaskStats(): Promise<Record<TaskStatus, number>> {
  const response = await fetch("/api/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "getStats" }),
  });

  const data = await readJson<{ error?: string; stats?: Record<TaskStatus, number> }>(response);
  if (!response.ok) {
    throw new Error(data?.error || `Failed to get task stats (${response.status})`);
  }
  return data?.stats || {
    draft: 0,
    in_progress: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  };
}
