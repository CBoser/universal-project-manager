// ============================================
// Universal Project Manager - Calculation Utilities
// ============================================

import type { Task, TaskState, Stats } from '../types';

/**
 * Calculate comprehensive project statistics
 */
export function calculateProgress(
  tasks: Task[],
  taskStates: { [key: string]: TaskState }
): Stats {
  const total = tasks.length;
  const completed = tasks.filter(t => taskStates[t.id]?.status === 'complete').length;
  const inProgress = tasks.filter(t => taskStates[t.id]?.status === 'in-progress').length;
  const blocked = tasks.filter(t => taskStates[t.id]?.status === 'blocked').length;

  let totalEst = 0;
  let totalActual = 0;
  let overruns = 0;

  tasks.forEach(task => {
    const state = taskStates[task.id];
    if (state) {
      const estHours = state.estHours || 0;
      const actualHours = parseFloat(state.actualHours || '0');

      totalEst += estHours;
      totalActual += actualHours;

      // Count tasks that went over estimate
      if (actualHours > estHours) {
        overruns++;
      }
    }
  });

  return {
    overall: {
      total,
      completed,
      inProgress,
      blocked,
    },
    totalEst,
    totalActual,
    overruns,
  };
}

/**
 * Calculate percentage complete
 */
export function calculatePercentComplete(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Calculate time variance (actual vs estimated)
 */
export function calculateTimeVariance(totalActual: number, totalEst: number): number {
  return totalActual - totalEst;
}

/**
 * Calculate time variance percentage
 */
export function calculateTimeVariancePercent(totalActual: number, totalEst: number): number {
  if (totalEst === 0) return 0;
  return Math.round(((totalActual - totalEst) / totalEst) * 100);
}

/**
 * Get phase statistics
 */
export function getPhaseStats(
  tasks: Task[],
  taskStates: { [key: string]: TaskState },
  phaseId: string
) {
  const phaseTasks = tasks.filter(t => t.phase === phaseId);
  return calculateProgress(phaseTasks, taskStates);
}

/**
 * Get category statistics
 */
export function getCategoryStats(
  tasks: Task[],
  taskStates: { [key: string]: TaskState },
  category: string
) {
  const categoryTasks = tasks.filter(t => t.category === category);
  return calculateProgress(categoryTasks, taskStates);
}

/**
 * Calculate estimated completion date based on current progress
 */
export function estimateCompletionDate(
  tasks: Task[],
  taskStates: { [key: string]: TaskState },
  hoursPerDay: number = 8
): Date | null {
  const stats = calculateProgress(tasks, taskStates);

  if (stats.overall.completed === 0) {
    return null; // Not enough data
  }

  const remainingHours = stats.totalEst - stats.totalActual;
  const daysRemaining = Math.ceil(remainingHours / hoursPerDay);

  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysRemaining);

  return completionDate;
}

/**
 * Identify at-risk tasks (actual > estimated)
 */
export function getAtRiskTasks(
  tasks: Task[],
  taskStates: { [key: string]: TaskState }
): Task[] {
  return tasks.filter(task => {
    const state = taskStates[task.id];
    if (!state) return false;

    const estHours = state.estHours || 0;
    const actualHours = parseFloat(state.actualHours || '0');

    return actualHours > estHours;
  });
}

/**
 * Get critical path tasks
 */
export function getCriticalPathTasks(tasks: Task[]): Task[] {
  return tasks.filter(t => t.criticalPath === true);
}

/**
 * Calculate burn rate (hours per day)
 */
export function calculateBurnRate(
  totalActual: number,
  daysSinceStart: number
): number {
  if (daysSinceStart === 0) return 0;
  return totalActual / daysSinceStart;
}
