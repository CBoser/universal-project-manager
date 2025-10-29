// ============================================
// Universal Project Manager - Time Log Service
// ============================================

export interface TimeLogEntry {
  id: string;
  projectId: string;
  projectName: string;
  taskId: string;
  taskName: string;
  subtaskId?: string;
  subtaskName?: string;
  userId: string;
  userName: string;
  date: string; // ISO date string
  hours: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TimeLogFilter {
  projectIds?: string[];
  taskIds?: string[];
  userIds?: string[];
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface TimeLogStats {
  totalHours: number;
  totalEntries: number;
  byProject: { [projectId: string]: number };
  byUser: { [userId: string]: number };
  byDate: { [date: string]: number };
}

const TIME_LOGS_KEY = 'upm_time_logs';

/**
 * Get all time log entries
 */
export function getAllTimeLogs(): TimeLogEntry[] {
  try {
    const data = localStorage.getItem(TIME_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading time logs:', error);
    return [];
  }
}

/**
 * Get a single time log entry by ID
 */
export function getTimeLog(logId: string): TimeLogEntry | undefined {
  const logs = getAllTimeLogs();
  return logs.find(l => l.id === logId);
}

/**
 * Create a new time log entry
 */
export function createTimeLog(log: Omit<TimeLogEntry, 'id' | 'createdAt'>): TimeLogEntry {
  const logs = getAllTimeLogs();

  const newLog: TimeLogEntry = {
    ...log,
    id: `timelog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  logs.push(newLog);
  saveTimeLogs(logs);

  return newLog;
}

/**
 * Update an existing time log entry
 */
export function updateTimeLog(logId: string, updates: Partial<TimeLogEntry>): TimeLogEntry | null {
  const logs = getAllTimeLogs();
  const index = logs.findIndex(l => l.id === logId);

  if (index === -1) return null;

  logs[index] = {
    ...logs[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveTimeLogs(logs);

  return logs[index];
}

/**
 * Delete a time log entry
 */
export function deleteTimeLog(logId: string): boolean {
  const logs = getAllTimeLogs();
  const filtered = logs.filter(l => l.id !== logId);

  if (filtered.length === logs.length) return false;

  saveTimeLogs(filtered);
  return true;
}

/**
 * Get filtered time logs
 */
export function getFilteredTimeLogs(filter: TimeLogFilter): TimeLogEntry[] {
  let logs = getAllTimeLogs();

  // Filter by project IDs
  if (filter.projectIds && filter.projectIds.length > 0) {
    logs = logs.filter(l => filter.projectIds!.includes(l.projectId));
  }

  // Filter by task IDs
  if (filter.taskIds && filter.taskIds.length > 0) {
    logs = logs.filter(l => filter.taskIds!.includes(l.taskId));
  }

  // Filter by user IDs
  if (filter.userIds && filter.userIds.length > 0) {
    logs = logs.filter(l => filter.userIds!.includes(l.userId));
  }

  // Filter by date range
  if (filter.startDate) {
    logs = logs.filter(l => l.date >= filter.startDate!);
  }
  if (filter.endDate) {
    logs = logs.filter(l => l.date <= filter.endDate!);
  }

  // Search query (searches in task name, subtask name, notes)
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    logs = logs.filter(l =>
      l.taskName.toLowerCase().includes(query) ||
      (l.subtaskName && l.subtaskName.toLowerCase().includes(query)) ||
      (l.notes && l.notes.toLowerCase().includes(query))
    );
  }

  // Sort by date (most recent first)
  logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return logs;
}

/**
 * Get time logs for a specific project
 */
export function getProjectTimeLogs(projectId: string): TimeLogEntry[] {
  return getAllTimeLogs().filter(l => l.projectId === projectId);
}

/**
 * Get time logs for a specific task
 */
export function getTaskTimeLogs(taskId: string): TimeLogEntry[] {
  return getAllTimeLogs().filter(l => l.taskId === taskId);
}

/**
 * Get time logs for a specific subtask
 */
export function getSubtaskTimeLogs(subtaskId: string): TimeLogEntry[] {
  return getAllTimeLogs().filter(l => l.subtaskId === subtaskId);
}

/**
 * Get time logs for a specific user
 */
export function getUserTimeLogs(userId: string): TimeLogEntry[] {
  return getAllTimeLogs().filter(l => l.userId === userId);
}

/**
 * Calculate statistics for filtered time logs
 */
export function calculateTimeLogStats(logs: TimeLogEntry[]): TimeLogStats {
  const stats: TimeLogStats = {
    totalHours: 0,
    totalEntries: logs.length,
    byProject: {},
    byUser: {},
    byDate: {},
  };

  logs.forEach(log => {
    // Total hours
    stats.totalHours += log.hours;

    // By project
    if (!stats.byProject[log.projectId]) {
      stats.byProject[log.projectId] = 0;
    }
    stats.byProject[log.projectId] += log.hours;

    // By user
    if (!stats.byUser[log.userId]) {
      stats.byUser[log.userId] = 0;
    }
    stats.byUser[log.userId] += log.hours;

    // By date
    if (!stats.byDate[log.date]) {
      stats.byDate[log.date] = 0;
    }
    stats.byDate[log.date] += log.hours;
  });

  return stats;
}

/**
 * Get time logs for a date range
 */
export function getTimeLogsInDateRange(startDate: string, endDate: string): TimeLogEntry[] {
  return getAllTimeLogs().filter(l => l.date >= startDate && l.date <= endDate);
}

/**
 * Get recent time logs (last N entries)
 */
export function getRecentTimeLogs(limit: number = 10): TimeLogEntry[] {
  const logs = getAllTimeLogs();
  return logs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/**
 * Delete all time logs for a project
 */
export function deleteProjectTimeLogs(projectId: string): number {
  const logs = getAllTimeLogs();
  const filtered = logs.filter(l => l.projectId !== projectId);
  const deletedCount = logs.length - filtered.length;

  if (deletedCount > 0) {
    saveTimeLogs(filtered);
  }

  return deletedCount;
}

/**
 * Delete all time logs for a task
 */
export function deleteTaskTimeLogs(taskId: string): number {
  const logs = getAllTimeLogs();
  const filtered = logs.filter(l => l.taskId !== taskId);
  const deletedCount = logs.length - filtered.length;

  if (deletedCount > 0) {
    saveTimeLogs(filtered);
  }

  return deletedCount;
}

/**
 * Save time logs to localStorage
 */
function saveTimeLogs(logs: TimeLogEntry[]): void {
  try {
    localStorage.setItem(TIME_LOGS_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving time logs:', error);
    throw new Error('Failed to save time logs');
  }
}

/**
 * Clear all time logs (use with caution)
 */
export function clearAllTimeLogs(): void {
  localStorage.removeItem(TIME_LOGS_KEY);
}

/**
 * Export time logs to CSV
 */
export function exportTimeLogsToCSV(logs: TimeLogEntry[]): string {
  const headers = [
    'Date',
    'Project',
    'Task',
    'Subtask',
    'User',
    'Hours',
    'Notes',
    'Created At'
  ];

  const rows = logs.map(log => [
    log.date,
    log.projectName,
    log.taskName,
    log.subtaskName || '',
    log.userName,
    log.hours.toString(),
    log.notes || '',
    new Date(log.createdAt).toLocaleString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Export time logs to JSON
 */
export function exportTimeLogsToJSON(logs: TimeLogEntry[]): string {
  return JSON.stringify(logs, null, 2);
}

/**
 * Get daily totals for a date range
 */
export function getDailyTotals(startDate: string, endDate: string): Array<{ date: string; hours: number }> {
  const logs = getTimeLogsInDateRange(startDate, endDate);
  const dailyTotals: { [date: string]: number } = {};

  logs.forEach(log => {
    if (!dailyTotals[log.date]) {
      dailyTotals[log.date] = 0;
    }
    dailyTotals[log.date] += log.hours;
  });

  return Object.entries(dailyTotals)
    .map(([date, hours]) => ({ date, hours }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
