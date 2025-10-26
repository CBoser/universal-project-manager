// ============================================
// Universal Project Manager - CSV Export Utility
// ============================================

import type { Task, TaskState, ProjectMeta, Stats } from '../types';

/**
 * Export project data to CSV format
 */
export function exportToCSV(
  tasks: Task[],
  taskStates: { [key: string]: TaskState },
  projectMeta: ProjectMeta,
  stats: Stats
): void {
  let csv = '';

  // Header section
  csv += `# ${projectMeta.name} - Project Progress Report\n`;
  csv += `Generated: ${new Date().toLocaleString()}\n`;
  if (projectMeta.description) {
    csv += `Description: ${projectMeta.description.replace(/\n/g, ' ')}\n`;
  }
  if (projectMeta.initialPrompt) {
    csv += `Initial Prompt: ${projectMeta.initialPrompt.replace(/\n/g, ' ')}\n`;
  }
  csv += `Project Type: ${projectMeta.projectType}\n`;
  csv += `Experience Level: ${projectMeta.experienceLevel}\n`;
  csv += `Project Lead: ${projectMeta.lead || 'Not specified'}\n`;
  csv += `Status: ${projectMeta.status}\n`;
  if (projectMeta.startDate) {
    csv += `Start Date: ${projectMeta.startDate}\n`;
  }
  if (projectMeta.targetEndDate) {
    csv += `Target End Date: ${projectMeta.targetEndDate}\n`;
  }
  if (projectMeta.budget) {
    csv += `Budget: $${projectMeta.budget.toLocaleString()}\n`;
  }
  csv += `\n`;

  // Summary statistics
  csv += `SUMMARY STATISTICS\n`;
  csv += `Total Tasks: ${stats.overall.total}\n`;
  csv += `Completed: ${stats.overall.completed}\n`;
  csv += `In Progress: ${stats.overall.inProgress}\n`;
  csv += `Blocked: ${stats.overall.blocked}\n`;
  csv += `Pending: ${stats.overall.total - stats.overall.completed - stats.overall.inProgress - stats.overall.blocked}\n`;
  csv += `\n`;
  csv += `Total Estimated Hours: ${stats.totalEst.toFixed(1)}\n`;
  csv += `Total Actual Hours: ${stats.totalActual.toFixed(1)}\n`;
  csv += `Variance: ${(stats.totalActual - stats.totalEst).toFixed(1)} hours\n`;
  csv += `Tasks Over Estimate: ${stats.overruns}\n`;
  csv += `\n`;

  // Task data
  csv += `TASK DETAILS\n`;
  csv += `Phase,Task,Category,Estimated Hours,Actual Hours,Status,Notes,Dependencies,Critical Path\n`;

  tasks.forEach(task => {
    const state = taskStates[task.id] || {};
    const deps = task.dependencies?.join(';') || '';
    const critical = task.criticalPath ? 'Yes' : 'No';

    csv += `"${task.phaseTitle}","${task.task}","${task.category}",`;
    csv += `"${state.estHours || 0}","${state.actualHours || ''}",`;
    csv += `"${state.status || 'pending'}","${state.notes || ''}",`;
    csv += `"${deps}","${critical}"\n`;
  });

  // Create and download file
  downloadCSV(csv, `project_${projectMeta.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
}

/**
 * Download CSV data as file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export tasks only (simple format for import)
 */
export function exportTasksToCSV(
  tasks: Task[],
  taskStates: { [key: string]: TaskState }
): void {
  let csv = 'Task,Phase,Category,Estimated Hours,Actual Hours,Status,Notes\n';

  tasks.forEach(task => {
    const state = taskStates[task.id] || {};
    csv += `"${task.task}","${task.phaseTitle}","${task.category}",`;
    csv += `"${state.estHours || 0}","${state.actualHours || ''}",`;
    csv += `"${state.status || 'pending'}","${state.notes || ''}"\n`;
  });

  downloadCSV(csv, `tasks_${new Date().toISOString().split('T')[0]}.csv`);
}
