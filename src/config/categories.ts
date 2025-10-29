// ============================================
// Universal Project Manager - Task Categories
// ============================================

/**
 * Canonical list of task categories used throughout the application.
 * This is the single source of truth for all category dropdowns and validations.
 */
export const TASK_CATEGORIES = [
  'Planning',
  'Research',
  'Design',
  'Development',
  'Implementation',
  'Configuration',
  'Testing',
  'Review',
  'Documentation',
  'Marketing',
  'Admin',
  'Other'
] as const;

/**
 * TypeScript type for task categories
 */
export type TaskCategory = typeof TASK_CATEGORIES[number];

/**
 * Default category for new tasks
 */
export const DEFAULT_CATEGORY: TaskCategory = 'Other';
