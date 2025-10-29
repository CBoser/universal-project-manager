// ============================================
// Universal Project Manager - Project Storage Service
// ============================================

import { SavedProject, ProjectMeta } from '../types';

const PROJECTS_STORAGE_KEY = 'upm_projects';
const CURRENT_PROJECT_KEY = 'upm_current_project_id';

/**
 * Get all projects from localStorage
 */
export function getAllProjects(): SavedProject[] {
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

/**
 * Get a single project by ID
 */
export function getProject(projectId: string): SavedProject | null {
  const projects = getAllProjects();
  return projects.find(p => p.meta.id === projectId) || null;
}

/**
 * Save a project (create or update)
 */
export function saveProject(project: SavedProject): void {
  try {
    const projects = getAllProjects();
    const existingIndex = projects.findIndex(p => p.meta.id === project.meta.id);

    // Update timestamps
    const now = new Date().toISOString();
    project.meta.updatedAt = now;
    if (!project.meta.createdAt) {
      project.meta.createdAt = now;
    }

    if (existingIndex >= 0) {
      // Update existing project
      projects[existingIndex] = project;
    } else {
      // Add new project
      projects.push(project);
    }

    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving project:', error);
    throw error;
  }
}

/**
 * Delete a project by ID
 */
export function deleteProject(projectId: string): void {
  try {
    const projects = getAllProjects();
    const filtered = projects.filter(p => p.meta.id !== projectId);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filtered));

    // If this was the current project, clear it
    if (getCurrentProjectId() === projectId) {
      setCurrentProjectId(null);
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

/**
 * Archive/unarchive a project
 */
export function archiveProject(projectId: string, archived: boolean = true): void {
  const project = getProject(projectId);
  if (project) {
    project.meta.archived = archived;
    saveProject(project);
  }
}

/**
 * Update project status
 */
export function updateProjectStatus(projectId: string, status: ProjectMeta['status']): void {
  const project = getProject(projectId);
  if (project) {
    project.meta.status = status;
    saveProject(project);
  }
}

/**
 * Get current project ID
 */
export function getCurrentProjectId(): string | null {
  return localStorage.getItem(CURRENT_PROJECT_KEY);
}

/**
 * Set current project ID
 */
export function setCurrentProjectId(projectId: string | null): void {
  if (projectId) {
    localStorage.setItem(CURRENT_PROJECT_KEY, projectId);
  } else {
    localStorage.removeItem(CURRENT_PROJECT_KEY);
  }
}

/**
 * Create a new empty project
 */
export function createNewProject(meta: ProjectMeta): SavedProject {
  const project: SavedProject = {
    meta: {
      ...meta,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false,
      status: meta.status || 'active',
    },
    tasks: [],
    taskStates: {},
    phases: [],
  };

  saveProject(project);
  return project;
}

/**
 * Calculate project statistics
 */
export function calculateProjectStats(project: SavedProject) {
  const tasks = project.tasks;
  const taskStates = project.taskStates;

  const total = tasks.length;
  let completed = 0;
  let inProgress = 0;
  let totalEstHours = 0;
  let totalActualHours = 0;

  tasks.forEach(task => {
    const state = taskStates[task.id];
    const status = state?.status;

    if (status === 'complete') completed++;
    if (status === 'in-progress') inProgress++;

    // Calculate hours from subtasks if they exist, otherwise use task-level hours
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach(st => {
        totalEstHours += st.estHours || 0;
        totalActualHours += st.actualHours || 0;
      });
    } else {
      totalEstHours += task.adjustedEstHours || 0;

      // Calculate actual hours from time logs
      if (state?.timeLogs) {
        totalActualHours += state.timeLogs.reduce((sum, log) => sum + log.hours, 0);
      }
    }
  });

  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    progress,
    totalEstHours,
    totalActualHours,
  };
}

/**
 * Get projects filtered by status
 */
export function getProjectsByStatus(status: ProjectMeta['status'] | 'all'): SavedProject[] {
  const projects = getAllProjects();
  if (status === 'all') {
    return projects.filter(p => !p.meta.archived);
  }
  return projects.filter(p => p.meta.status === status && !p.meta.archived);
}

/**
 * Get archived projects
 */
export function getArchivedProjects(): SavedProject[] {
  const projects = getAllProjects();
  return projects.filter(p => p.meta.archived);
}

/**
 * Export project to JSON
 */
export function exportProjectToJSON(projectId: string): string {
  const project = getProject(projectId);
  if (!project) throw new Error('Project not found');
  return JSON.stringify(project, null, 2);
}

/**
 * Import project from JSON
 */
export function importProjectFromJSON(jsonString: string): SavedProject {
  try {
    const project = JSON.parse(jsonString) as SavedProject;

    // Generate new ID to avoid conflicts
    project.meta.id = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    project.meta.createdAt = new Date().toISOString();
    project.meta.updatedAt = new Date().toISOString();

    saveProject(project);
    return project;
  } catch (error) {
    console.error('Error importing project:', error);
    throw error;
  }
}
