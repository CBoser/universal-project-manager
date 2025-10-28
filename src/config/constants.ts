// ============================================
// Universal Project Manager - Constants
// ============================================

import type { ProjectMeta, Task } from '../types';

/**
 * Default project metadata
 */
export const DEFAULT_PROJECT_META: ProjectMeta = {
  id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: 'New Project',
  description: 'Describe your project here...',
  projectType: 'custom',
  experienceLevel: 'intermediate',
  lead: 'Project Lead',
  status: 'active',
  icon: '📋',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Experience level time multipliers
 */
export const EXPERIENCE_MULTIPLIERS = {
  novice: 1.5,        // +50% time for learning curve
  intermediate: 1.0,   // Standard time
  expert: 0.75,       // -25% time for efficiency
};

/**
 * Default task categories (universal)
 */
export const DEFAULT_CATEGORIES = [
  'Planning',
  'Research',
  'Design',
  'Development',
  'Implementation',
  'Testing',
  'Review',
  'Documentation',
  'Marketing',
  'Admin',
  'Other',
];

/**
 * Initial deliverables - BLANK TEMPLATE
 * Users start with a blank slate and use AI to generate tasks
 */
export const INITIAL_DELIVERABLES: Task[] = [];

/**
 * Export format options
 */
export const EXPORT_FORMATS = [
  {
    value: 'csv',
    label: 'CSV',
    icon: '📊',
    description: 'Spreadsheet format for Excel, Google Sheets',
  },
  {
    value: 'json',
    label: 'JSON',
    icon: '📄',
    description: 'Raw data for integrations',
  },
  {
    value: 'pdf',
    label: 'PDF',
    icon: '📑',
    description: 'Print-friendly report',
  },
  {
    value: 'api',
    label: 'API',
    icon: '🔗',
    description: 'Send to external system',
  },
];

/**
 * Local storage key
 */
export const STORAGE_KEY = 'universal_project_data';

/**
 * AI configuration
 */
export const AI_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 8000, // Increased for complex projects with detailed descriptions
  temperature: 0.7,
  timeout: 120000, // 2 minutes timeout for long descriptions
};
