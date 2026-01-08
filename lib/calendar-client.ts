import type {
  CalendarTask,
  CreateTaskParams,
  UpdateTaskParams,
  TaskStatus,
  UpcomingTask,
  IncompleteTask,
} from "./calendar-service";

/**
 * Create a new calendar task
 */
export async function createTask(params: CreateTaskParams): Promise<{ success: boolean; task: CalendarTask }> {
  const response = await fetch("/api/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create", ...params }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create task");
  }

  return response.json();
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to list tasks");
  }

  const data = await response.json();
  return data.tasks;
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get task");
  }

  const data = await response.json();
  return data.task;
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update task");
  }

  return response.json();
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete task");
  }

  return response.json();
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get upcoming tasks");
  }

  const data = await response.json();
  return data.tasks;
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get incomplete tasks");
  }

  const data = await response.json();
  return data.tasks;
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get task stats");
  }

  const data = await response.json();
  return data.stats;
}
