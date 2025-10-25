// ============================================
// Universal Project Manager - useTaskManagement Hook
// ============================================

import { useState, useCallback } from 'react';
import type { Task, TaskState } from '../types';

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
  };
}
