/**
 * Project API Service
 * Handles all project-related API calls to sync with the backend database
 */

import type { SavedProject, Task, Phase } from '../types';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  project?: T;
  projects?: T[];
  task?: T;
  tasks?: T[];
}

/**
 * Transform frontend SavedProject to backend project format
 */
function transformProjectToApi(project: SavedProject) {
  const meta = project.meta;
  return {
    name: meta.name,
    description: meta.description || '',
    projectType: meta.projectType,
    experienceLevel: meta.experienceLevel,
    status: meta.status,
    icon: meta.icon || '📁',
    budget: meta.budget || null,
    timeline: meta.timeline || '',
    lead: meta.lead || '',
    startDate: meta.startDate || null,
    targetEndDate: meta.targetEndDate || null,
    phases: project.phases || [],
    archived: meta.archived || false,
  };
}

/**
 * Transform backend project to frontend SavedProject format
 */
function transformProjectFromApi(apiProject: any, tasks: any[] = []): SavedProject {
  // Parse phases if they're stored as JSON string
  let phases: Phase[] = [];
  if (typeof apiProject.phases === 'string') {
    try {
      phases = JSON.parse(apiProject.phases);
    } catch (e) {
      phases = [];
    }
  } else if (Array.isArray(apiProject.phases)) {
    phases = apiProject.phases;
  }

  // Transform tasks and build taskStates
  const frontendTasks: Task[] = [];
  const taskStates: { [taskId: string]: any } = {};

  tasks.forEach((task: any) => {
    const taskId = task.id;

    // Build the Task object (using frontend Task interface fields)
    frontendTasks.push({
      id: taskId,
      task: task.name, // Backend 'name' -> frontend 'task'
      phase: task.phase_id || '',
      phaseTitle: '', // Will be populated by frontend
      category: task.category || 'other',
      adjustedEstHours: task.estimated_hours || 0,
      dependencies: task.dependencies || [],
      subtasks: [],
      notes: task.description || '', // Backend 'description' -> frontend 'notes'
    });

    // Build the TaskState object
    taskStates[taskId] = {
      status: task.status || 'not-started',
      notes: task.notes || '',
      actualHours: task.actual_hours?.toString() || '0',
      blockedReason: task.blocked_reason || '',
      completedDate: task.completed_date || null,
      timeLogs: [],
    };
  });

  return {
    meta: {
      id: apiProject.id,
      name: apiProject.name,
      description: apiProject.description || '',
      projectType: apiProject.project_type || 'other',
      experienceLevel: apiProject.experience_level || 'intermediate',
      status: apiProject.status || 'active',
      icon: apiProject.icon || '📁',
      lead: apiProject.lead || '',
      archived: apiProject.archived || false,
      createdAt: apiProject.created_at,
      updatedAt: apiProject.updated_at,
      startDate: apiProject.start_date,
      targetEndDate: apiProject.target_end_date,
      budget: apiProject.budget,
      timeline: apiProject.timeline || '',
      collaborators: [],
    },
    tasks: frontendTasks,
    taskStates,
    phases,
  };
}

/**
 * Get all projects for the current user
 */
export async function getAllProjects(includeArchived: boolean = false): Promise<SavedProject[]> {
  try {
    const url = includeArchived
      ? `${API_URL}/api/projects`
      : `${API_URL}/api/projects?archived=false`;

    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Not authenticated');
      }
      throw new Error('Failed to fetch projects');
    }

    const data: ApiResponse = await response.json();

    if (!data.success || !data.projects) {
      throw new Error(data.error || 'Failed to fetch projects');
    }

    // For each project, we need to fetch its tasks
    // For now, we'll return projects with empty tasks
    // In a real scenario, you might want to fetch tasks separately or use a different endpoint
    return data.projects.map(proj => transformProjectFromApi(proj, []));
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

/**
 * Get a single project with all its tasks
 */
export async function getProject(projectId: string): Promise<SavedProject> {
  try {
    const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Not authenticated');
      }
      if (response.status === 404) {
        throw new Error('Project not found');
      }
      throw new Error('Failed to fetch project');
    }

    const data: ApiResponse = await response.json();

    if (!data.success || !data.project) {
      throw new Error(data.error || 'Failed to fetch project');
    }

    // Backend returns project with tasks included
    return transformProjectFromApi(data.project, data.project.tasks || []);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

/**
 * Create a new project
 */
export async function createProject(project: SavedProject): Promise<SavedProject> {
  try {
    const apiProject = transformProjectToApi(project);

    const response = await fetch(`${API_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(apiProject),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Not authenticated');
      }
      throw new Error('Failed to create project');
    }

    const data: ApiResponse = await response.json();

    if (!data.success || !data.project) {
      throw new Error(data.error || 'Failed to create project');
    }

    // Now create all tasks for this project
    const createdProject = transformProjectFromApi(data.project, []);

    // Save tasks if there are any
    if (project.tasks && project.tasks.length > 0) {
      for (const task of project.tasks) {
        const taskState = project.taskStates[task.id];
        await createTask(createdProject.meta.id, task, taskState);
      }
      // Fetch the complete project with tasks
      return await getProject(createdProject.meta.id);
    }

    return createdProject;
  } catch (error: any) {
    console.error('Error creating project:', error);
    throw error;
  }
}

/**
 * Update an existing project
 */
export async function updateProject(project: SavedProject): Promise<SavedProject> {
  try {
    const apiProject = transformProjectToApi(project);

    const response = await fetch(`${API_URL}/api/projects/${project.meta.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(apiProject),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Not authenticated');
      }
      if (response.status === 404) {
        throw new Error('Project not found');
      }
      throw new Error('Failed to update project');
    }

    const data: ApiResponse = await response.json();

    if (!data.success || !data.project) {
      throw new Error(data.error || 'Failed to update project');
    }

    // Return updated project
    return transformProjectFromApi(data.project, []);
  } catch (error: any) {
    console.error('Error updating project:', error);
    throw error;
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Not authenticated');
      }
      if (response.status === 404) {
        throw new Error('Project not found');
      }
      throw new Error('Failed to delete project');
    }

    const data: ApiResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete project');
    }
  } catch (error: any) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

/**
 * Create a task for a project
 */
export async function createTask(projectId: string, task: Task, taskState?: any): Promise<any> {
  try {
    const apiTask = {
      name: task.task, // Frontend 'task' -> backend 'name'
      description: task.notes || '', // Frontend 'notes' -> backend 'description'
      phaseId: task.phase || null,
      category: task.category || 'other',
      priority: 'medium', // Default priority (not in frontend Task)
      status: taskState?.status || 'not-started',
      dependencies: task.dependencies || [],
      estimatedHours: task.adjustedEstHours || 0,
      order: 0, // Default order (not in frontend Task)
      notes: taskState?.notes || '',
      actualHours: parseFloat(taskState?.actualHours || '0'),
      blockedReason: taskState?.blockedReason || '',
      completedDate: taskState?.completedDate || null,
    };

    const response = await fetch(`${API_URL}/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(apiTask),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Not authenticated');
      }
      throw new Error('Failed to create task');
    }

    const data: ApiResponse = await response.json();

    if (!data.success || !data.task) {
      throw new Error(data.error || 'Failed to create task');
    }

    return data.task;
  } catch (error: any) {
    console.error('Error creating task:', error);
    throw error;
  }
}

/**
 * Update a task
 */
export async function updateTask(
  projectId: string,
  taskId: string,
  task: Task,
  taskState?: any
): Promise<any> {
  try {
    const apiTask = {
      name: task.task, // Frontend 'task' -> backend 'name'
      description: task.notes || '', // Frontend 'notes' -> backend 'description'
      phaseId: task.phase || null,
      category: task.category || 'other',
      priority: 'medium', // Default priority (not in frontend Task)
      status: taskState?.status || 'not-started',
      dependencies: task.dependencies || [],
      estimatedHours: task.adjustedEstHours || 0,
      order: 0, // Default order (not in frontend Task)
      notes: taskState?.notes || '',
      actualHours: parseFloat(taskState?.actualHours || '0'),
      blockedReason: taskState?.blockedReason || '',
      completedDate: taskState?.completedDate || null,
    };

    const response = await fetch(`${API_URL}/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(apiTask),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Not authenticated');
      }
      throw new Error('Failed to update task');
    }

    const data: ApiResponse = await response.json();

    if (!data.success || !data.task) {
      throw new Error(data.error || 'Failed to update task');
    }

    return data.task;
  } catch (error: any) {
    console.error('Error updating task:', error);
    throw error;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Not authenticated');
      }
      throw new Error('Failed to delete task');
    }

    const data: ApiResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete task');
    }
  } catch (error: any) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

/**
 * Sync local project with server
 * This is a convenience function that either creates or updates based on whether the project exists
 */
export async function syncProject(project: SavedProject): Promise<SavedProject> {
  try {
    // Try to get the project first
    try {
      await getProject(project.meta.id);
      // Project exists, update it
      return await updateProject(project);
    } catch (error: any) {
      if (error.message === 'Project not found') {
        // Project doesn't exist, create it
        return await createProject(project);
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error syncing project:', error);
    throw error;
  }
}
