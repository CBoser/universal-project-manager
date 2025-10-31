// ============================================
// Universal Project Manager - useTaskManagement Hook
// ============================================

import { useState, useCallback } from 'react';
import type { Task, TaskState, Subtask } from '../types';

/**
 * Custom hook for managing tasks and their states
 */
export function useTaskManagement(initialTasks: Task[], initialTaskStates: { [key: string]: TaskState } = {}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [taskStates, setTaskStates] = useState<{ [key: string]: TaskState }>(initialTaskStates);

  /**
   * Add a new task
   */
  const addTask = useCallback((task: Task) => {
    setTasks(prev => [...prev, task]);
    // Initialize task state
    setTaskStates(prev => ({
      ...prev,
      [task.id]: {
        estHours: task.adjustedEstHours,
        actualHours: '',
        status: 'pending',
        notes: '',
      },
    }));
  }, []);

  /**
   * Update an existing task (accepts full task object or taskId + updates)
   */
  const updateTask = useCallback((taskOrId: Task | string, updates?: Partial<Task>) => {
    if (typeof taskOrId === 'string') {
      // Called with taskId and updates
      setTasks(prev => prev.map(t => (t.id === taskOrId ? { ...t, ...updates } : t)));
    } else {
      // Called with full task object
      setTasks(prev => prev.map(t => (t.id === taskOrId.id ? taskOrId : t)));
    }
  }, []);

  /**
   * Delete a task
   */
  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setTaskStates(prev => {
      const newStates = { ...prev };
      delete newStates[taskId];
      return newStates;
    });
  }, []);

  /**
   * Reorder tasks (for drag and drop)
   */
  const reorderTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  /**
   * Update task state (progress tracking)
   */
  const updateTaskState = useCallback((taskId: string, field: keyof TaskState, value: any) => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value,
      },
    }));
  }, []);

  /**
   * Bulk update task states (e.g., when changing experience level)
   */
  const bulkUpdateTaskStates = useCallback((updates: { [key: string]: Partial<TaskState> }) => {
    setTaskStates(prev => {
      const newStates = { ...prev };
      Object.keys(updates).forEach(taskId => {
        newStates[taskId] = {
          ...newStates[taskId],
          ...updates[taskId],
        };
      });
      return newStates;
    });
  }, []);

  /**
   * Get task state by ID
   */
  const getTaskState = useCallback((taskId: string): TaskState => {
    return taskStates[taskId] || {
      estHours: 0,
      actualHours: '',
      status: 'pending',
      notes: '',
    };
  }, [taskStates]);

  /**
   * Move task to different phase
   */
  const moveTaskToPhase = useCallback((taskId: string, newPhase: string, newPhaseTitle: string) => {
    setTasks(prev => prev.map(t => (
      t.id === taskId
        ? { ...t, phase: newPhase, phaseTitle: newPhaseTitle }
        : t
    )));
  }, []);

  /**
   * Add a single subtask to a task
   */
  const addSubtask = useCallback((taskId: string, subtask: Subtask) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const existingSubtasks = t.subtasks || [];
        return {
          ...t,
          subtasks: [...existingSubtasks, subtask],
          subtaskHourMode: t.subtaskHourMode || 'manual'
        };
      }
      return t;
    }));
  }, []);

  /**
   * Add multiple subtasks to a task at once
   */
  const bulkAddSubtasks = useCallback((taskId: string, subtasks: Subtask[]) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const existingSubtasks = t.subtasks || [];
        return {
          ...t,
          subtasks: [...existingSubtasks, ...subtasks],
          subtaskHourMode: t.subtaskHourMode || 'auto'
        };
      }
      return t;
    }));
  }, []);

  /**
   * Update a subtask's properties
   */
  const updateSubtask = useCallback((taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.subtasks) {
        return {
          ...t,
          subtasks: t.subtasks.map(st =>
            st.id === subtaskId ? { ...st, ...updates } : st
          )
        };
      }
      return t;
    }));
  }, []);

  /**
   * Delete a subtask from a task
   */
  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.subtasks) {
        return {
          ...t,
          subtasks: t.subtasks.filter(st => st.id !== subtaskId)
        };
      }
      return t;
    }));
  }, []);

  /**
   * Toggle a subtask's status between pending and completed
   */
  const toggleSubtaskStatus = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.subtasks) {
        return {
          ...t,
          subtasks: t.subtasks.map(st => {
            if (st.id === subtaskId) {
              const newStatus = st.status === 'completed' ? 'pending' : 'completed';
              return {
                ...st,
                status: newStatus,
                completedDate: newStatus === 'completed' ? new Date().toISOString() : undefined
              };
            }
            return st;
          })
        };
      }
      return t;
    }));
  }, []);

  /**
   * Reorder subtasks within a task
   */
  const reorderSubtasks = useCallback((taskId: string, newSubtasks: Subtask[]) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: newSubtasks.map((st, index) => ({ ...st, order: index }))
        };
      }
      return t;
    }));
  }, []);

  /**
   * Calculate task hours based on subtasks (if in auto mode)
   */
  const calculateTaskHours = useCallback((task: Task): number => {
    if (task.subtaskHourMode === 'auto' && task.subtasks && task.subtasks.length > 0) {
      return task.subtasks.reduce((sum, st) => sum + (st.estHours || 0), 0);
    }
    return task.adjustedEstHours || task.baseEstHours || 0;
  }, []);

  /**
   * Get subtask progress for a task
   */
  const getSubtaskProgress = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks || task.subtasks.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const total = task.subtasks.length;
    const completed = task.subtasks.filter((st: { status: string }) => st.status === 'completed').length;
    const percentage = (completed / total) * 100;

    return { completed, total, percentage };
  }, [tasks]);

  return {
    tasks,
    taskStates,
    setTasks,
    setTaskStates,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    updateTaskState,
    bulkUpdateTaskStates,
    getTaskState,
    moveTaskToPhase,
    // Subtask operations
    addSubtask,
    bulkAddSubtasks,
    updateSubtask,
    deleteSubtask,
    toggleSubtaskStatus,
    reorderSubtasks,
    calculateTaskHours,
    getSubtaskProgress,
  };
}
