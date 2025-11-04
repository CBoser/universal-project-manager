// ============================================
// Universal Project Manager - Main Application
// ============================================

import React, { useState, useEffect } from 'react';
import { theme } from './config/theme';
import { DEFAULT_PROJECT_META, DEFAULT_CATEGORIES } from './config/constants';
import { useTaskManagement } from './hooks/useTaskManagement';
import { useIsMobileOrTablet } from './hooks/useMediaQuery';
import { storageService } from './services/storageService';
import { aiService } from './services/aiService';
import { calculateProgress, calculatePercentComplete } from './utils/calculations';
import { exportToCSV } from './utils/csvExport';
import AIAnalysisModal from './components/modals/AIAnalysisModal';
import ImportModal from './components/modals/ImportModal';
import AddTaskModal from './components/modals/AddTaskModal';
import EditTaskModal from './components/modals/EditTaskModal';
import ProjectInfoModal from './components/modals/ProjectInfoModal';
import PhaseManagementModal from './components/modals/PhaseManagementModal';
import CategoryManagementModal from './components/modals/CategoryManagementModal';
import ReportsHistoryModal, { type ProgressSnapshot } from './components/modals/ReportsHistoryModal';
import AnalyticsReportsModal from './components/modals/AnalyticsReportsModal';
import CollaboratorManagementModal from './components/modals/CollaboratorManagementModal';
import VersionManagementModal from './components/modals/VersionManagementModal';
import SettingsModal from './components/modals/SettingsModal';
import NewProjectChoiceModal from './components/modals/NewProjectChoiceModal';
import CreateBlankProjectModal from './components/modals/CreateBlankProjectModal';
import ImportProjectModal from './components/modals/ImportProjectModal';
import DropdownButton from './components/DropdownButton';
import DevNotes from './components/dev/DevNotes';
import Dashboard from './components/Dashboard';
import { IterateProjectModal } from './components/modals/IterateProjectModal';
import { SubtaskList } from './components/SubtaskList';
import { TimeTrackingModal } from './components/modals/TimeTrackingModal';
import { UserManagementModal } from './components/modals/UserManagementModal';
import { TimeLogViewerModal } from './components/modals/TimeLogViewerModal';
import Login from './components/Login';
import Register from './components/Register';
import { MobileNav, MobileTaskCard } from './components/mobile';
import type { ProjectMeta, AIAnalysisRequest, TaskStatus, Task, Collaborator, SavedProject, IterationResponse } from './types';
import {
  getProject,
  saveProject as saveProjectToStorage,
  getCurrentProjectId,
  setCurrentProjectId,
  syncFromServer,
  setSyncEnabled,
  setSyncStatusCallback,
  getLastSyncTime,
} from './services/projectStorage';
import { createTimeLog } from './services/timeLogService';
import { getActiveUsers } from './services/userService';
import * as authService from './services/authApiService';
import { SyncIndicator, type SyncStatus } from './components/SyncIndicator';

interface MoveHistory {
  taskId: string;
  fromIndex: number;
  toIndex: number;
}

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState<boolean>(true); // true = login, false = register
  const [authError, setAuthError] = useState<string>('');
  const [projectSyncKey, setProjectSyncKey] = useState<number>(0); // Used to trigger Dashboard refresh

  // Sync status state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState<string>('');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(getLastSyncTime());

  // Register sync status callback
  useEffect(() => {
    setSyncStatusCallback((status, error) => {
      setSyncStatus(status);
      if (error) {
        setSyncError(error);
      } else {
        setSyncError('');
      }
      if (status === 'synced') {
        setLastSyncTime(new Date().toISOString());
        // Refresh Dashboard by incrementing key
        setProjectSyncKey(prev => prev + 1);
      }
    });

    return () => {
      setSyncStatusCallback(null);
    };
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[Auth] Checking authentication status...');

        // Add a timeout to prevent hanging
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), 10000)
        );

        const authPromise = authService.getCurrentUser();

        const user = await Promise.race([authPromise, timeoutPromise]) as any;

        if (user) {
          console.log('[Auth] User authenticated:', user.email);
          setIsAuthenticated(true);
          setCurrentUser(user);

          // Enable sync and load projects from server for already logged-in users
          setSyncEnabled(true);
          await syncFromServer();
          console.log('[Auth] Projects synced from server on app load');
        } else {
          console.log('[Auth] No authenticated user found');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('[Auth] Error checking authentication:', error);
        // Ensure we show login screen on error
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        console.log('[Auth] Auth check complete, showing UI');
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log('[Auth] Attempting login for:', email);
      setAuthError('');
      const user = await authService.login(email, password);
      console.log('[Auth] Login successful, user:', user.email);
      setCurrentUser(user);
      setIsAuthenticated(true);

      // Enable database sync and load projects from server
      console.log('[Auth] Enabling sync and fetching projects...');
      setSyncEnabled(true);
      await syncFromServer();
      console.log('[Auth] Projects synced from server after login');
      console.log('[Auth] Login flow complete, showing dashboard');
    } catch (error: any) {
      console.error('[Auth] Login failed:', error);
      setAuthError(error.message || 'Login failed');
      throw error;
    }
  };

  // Handle registration
  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      console.log('[Auth] Attempting registration for:', email);
      setAuthError('');
      const user = await authService.register(email, password, name);
      console.log('[Auth] Registration successful, user:', user.email);
      setCurrentUser(user);
      setIsAuthenticated(true);

      // Enable database sync for new users
      console.log('[Auth] Enabling sync for new user...');
      setSyncEnabled(true);
      console.log('[Auth] Database sync enabled for new user');
      console.log('[Auth] Registration flow complete, showing dashboard');
    } catch (error: any) {
      console.error('[Auth] Registration failed:', error);
      setAuthError(error.message || 'Registration failed');
      throw error;
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);

      // Disable sync when logging out
      setSyncEnabled(false);
      console.log('Database sync disabled after logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ============================================
  // ALL HOOKS MUST BE DECLARED BEFORE ANY RETURNS
  // (React Rules of Hooks requirement)
  // ============================================

  // View state: 'dashboard' or 'project'
  const [currentView, setCurrentView] = useState<'dashboard' | 'project'>('dashboard');
  const [currentProjectId, setCurrentProjectIdState] = useState<string | null>(getCurrentProjectId());

  // Mobile detection
  const isMobile = useIsMobileOrTablet();

  // Load saved data or use defaults
  const savedData = storageService.load();

  const [projectMeta, setProjectMeta] = useState<ProjectMeta>(
    savedData?.projectMeta || DEFAULT_PROJECT_META
  );

  const {
    tasks,
    taskStates,
    setTasks,
    setTaskStates,
    addTask,
    updateTask,
    deleteTask,
    updateTaskState,
    reorderTasks,
    updateSubtask,
    toggleSubtaskStatus,
    deleteSubtask,
  } = useTaskManagement(savedData?.tasks || [], savedData?.taskStates || {});

  const [phaseColors, setPhaseColors] = useState(savedData?.phaseColors || {});
  const [categories, setCategories] = useState<string[]>(savedData?.categories || DEFAULT_CATEGORIES);
  const [progressSnapshots, setProgressSnapshots] = useState<ProgressSnapshot[]>(savedData?.progressSnapshots || []);
  const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([]);

  // Modal states
  const [showNewProjectChoiceModal, setShowNewProjectChoiceModal] = useState(false);
  const [showCreateBlankProjectModal, setShowCreateBlankProjectModal] = useState(false);
  const [showAIAnalysisModal, setShowAIAnalysisModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportProjectModal, setShowImportProjectModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showProjectInfoModal, setShowProjectInfoModal] = useState(false);
  const [showIterateProjectModal, setShowIterateProjectModal] = useState(false);
  const [showPhaseManagementModal, setShowPhaseManagementModal] = useState(false);
  const [showCategoryManagementModal, setShowCategoryManagementModal] = useState(false);
  const [showReportsHistoryModal, setShowReportsHistoryModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTimeTrackingModal, setShowTimeTrackingModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [showTimeLogViewerModal, setShowTimeLogViewerModal] = useState(false);

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<'tools' | 'data' | 'export' | null>(null);

  // Autosave states
  const [lastSaved, setLastSaved] = useState<string | null>(savedData?.savedAt || null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(() => {
    const saved = localStorage.getItem('autoSaveInterval');
    return saved ? parseInt(saved) : 5; // Default 5 minutes
  });

  // Task editing
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Phase tabs
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  // Status filter
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  // Drag and drop
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Expanded subtasks tracking
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());

  // Current user for time logging
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem('current_user_id');
    return saved || null;
  });

  // Calculate phases from tasks
  const phases: { [key: string]: string } = {};
  tasks.forEach(task => {
    if (!phases[task.phase]) {
      phases[task.phase] = task.phaseTitle;
    }
  });

  // Calculate statistics
  const stats = calculateProgress(tasks, taskStates);
  const percentComplete = calculatePercentComplete(stats.overall.completed, stats.overall.total);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const phaseMatch = selectedPhase === 'all' || task.phase === selectedPhase;
    const statusMatch = statusFilter === 'all' || (taskStates[task.id]?.status || 'pending') === statusFilter;
    return phaseMatch && statusMatch;
  });

  // Calculate task counts per phase
  const phaseTaskCounts: { [key: string]: number } = {};
  tasks.forEach(task => {
    phaseTaskCounts[task.phase] = (phaseTaskCounts[task.phase] || 0) + 1;
  });

  // ==========================
  // Multi-Project Functions
  // ==========================

  const saveCurrentProject = () => {
    if (!currentProjectId) return;

    const project: SavedProject = {
      meta: projectMeta,
      tasks,
      taskStates,
      phases: Object.keys(phases).map(phaseId => ({
        phaseId,
        phaseTitle: phases[phaseId],
        description: '',
        color: phaseColors[phaseId] || '#607D8B',
        typicalDuration: 0,
      })),
    };

    saveProjectToStorage(project);
  };

  const loadProject = (projectId: string) => {
    const project = getProject(projectId);
    if (!project) {
      alert('Project not found');
      return;
    }

    // Load project data into state
    setProjectMeta(project.meta);
    setTasks(project.tasks);
    setTaskStates(project.taskStates);

    // Load phase colors
    const colors: { [key: string]: string } = {};
    project.phases.forEach(phase => {
      colors[phase.phaseId] = phase.color;
    });
    setPhaseColors(colors);

    // Set current project and view
    setCurrentProjectIdState(projectId);
    setCurrentProjectId(projectId);
    setCurrentView('project');
  };

  const handleOpenProject = (projectId: string) => {
    // Save current project first if we're in a project
    if (currentProjectId && currentView === 'project') {
      saveCurrentProject();
    }

    // Load the selected project
    loadProject(projectId);
  };

  const handleBackToDashboard = () => {
    // Save current project before going back
    if (currentProjectId) {
      saveCurrentProject();
    }

    setCurrentView('dashboard');
    setCurrentProjectId(null);
    setCurrentProjectIdState(null);
  };

  const handleNewProject = () => {
    // Save current project if any
    if (currentProjectId && currentView === 'project') {
      saveCurrentProject();
    }

    // Show the choice modal
    setShowNewProjectChoiceModal(true);
  };

  const handleChooseAISetup = () => {
    setShowNewProjectChoiceModal(false);
    setShowAIAnalysisModal(true);
  };

  const handleChooseManualProject = () => {
    setShowNewProjectChoiceModal(false);
    setShowCreateBlankProjectModal(true);
  };

  const handleChooseImportCSV = () => {
    setShowNewProjectChoiceModal(false);
    setShowImportModal(true);
  };

  const handleChooseImportJSON = () => {
    setShowNewProjectChoiceModal(false);
    setShowImportProjectModal(true);
  };

  const handleImportProject = (project: SavedProject) => {
    // Generate new ID to avoid conflicts
    const newProjectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update project with new ID and timestamps
    const newProject: SavedProject = {
      ...project,
      meta: {
        ...project.meta,
        id: newProjectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    // Save the project
    saveProjectToStorage(newProject);

    // Load the project into view
    setProjectMeta(newProject.meta);
    setTasks(newProject.tasks);
    setTaskStates(newProject.taskStates);

    // Load phase colors
    const colors: { [key: string]: string } = {};
    newProject.phases.forEach(phase => {
      colors[phase.phaseId] = phase.color;
    });
    setPhaseColors(colors);

    setCurrentProjectIdState(newProjectId);
    setCurrentProjectId(newProjectId);
    setCurrentView('project');

    setShowImportProjectModal(false);
    alert(`Project "${newProject.meta.name}" imported successfully with ${newProject.tasks.length} tasks!`);
  };

  const handleCreateBlankProject = (projectData: {
    name: string;
    description: string;
    projectType: any;
    experienceLevel: any;
    icon: string;
  }) => {
    // Create new project ID
    const newProjectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create project metadata
    const newProjectMeta: ProjectMeta = {
      id: newProjectId,
      name: projectData.name,
      description: projectData.description || undefined,
      projectType: projectData.projectType,
      experienceLevel: projectData.experienceLevel,
      status: 'active',
      icon: projectData.icon,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create blank project
    const newProject: SavedProject = {
      meta: newProjectMeta,
      tasks: [],
      taskStates: {},
      phases: [],
    };

    // Save the new project
    saveProjectToStorage(newProject);

    // Load the new project into view
    setProjectMeta(newProjectMeta);
    setTasks([]);
    setTaskStates({});
    setPhaseColors({});
    setCurrentProjectIdState(newProjectId);
    setCurrentProjectId(newProjectId);
    setCurrentView('project');

    setShowCreateBlankProjectModal(false);
    alert(`Project "${projectData.name}" created! Start adding tasks manually.`);
  };

  // Auto-save at configured interval
  useEffect(() => {
    if (autoSaveInterval <= 0) return; // Autosave disabled

    const interval = setInterval(() => {
      handleSave(false); // Silent autosave
    }, autoSaveInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [tasks, taskStates, projectMeta, phaseColors, categories, progressSnapshots, autoSaveInterval]);

  // Save autosave interval to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('autoSaveInterval', autoSaveInterval.toString());
  }, [autoSaveInterval]);

  // Click-outside handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const handleSave = (showAlert: boolean = true) => {
    setIsSaving(true);

    try {
      const now = new Date().toISOString();

      // Save to legacy storage service for backwards compatibility
      storageService.save({
        tasks,
        taskStates,
        projectMeta,
        phaseColors,
        categories,
        progressSnapshots,
        savedAt: now,
      });

      // Also save to new project storage if we're in a project
      if (currentProjectId) {
        saveCurrentProject();
      }

      setLastSaved(now);

      if (showAlert) {
        alert('Progress saved!');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIAnalysis = async (request: AIAnalysisRequest, useRealAI: boolean) => {
    try {
      const service = useRealAI ? aiService : aiService; // Will use mock if no API key
      const result = await service.analyzeProjectAndGenerateTasks(request);

      // Create new project metadata with generated ID
      const newProjectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newProjectMeta: ProjectMeta = {
        id: newProjectId,
        name: request.projectDescription.slice(0, 50) + (request.projectDescription.length > 50 ? '...' : ''),
        description: request.projectDescription,
        initialPrompt: request.projectDescription,
        projectType: request.projectType,
        experienceLevel: request.experienceLevel,
        budget: request.budget,
        timeline: request.timeline,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        icon: '📋',
      };

      // Create phase colors from result
      const newPhaseColors: { [key: string]: string } = {};
      result.suggestedPhases.forEach(phase => {
        newPhaseColors[phase.phaseId] = phase.color;
      });

      // Create new project
      const newProject: SavedProject = {
        meta: newProjectMeta,
        tasks: result.suggestedTasks,
        taskStates: {},
        phases: result.suggestedPhases,
      };

      // Save the new project
      saveProjectToStorage(newProject);

      // Load the new project into view
      setProjectMeta(newProjectMeta);
      setTasks(result.suggestedTasks);
      setTaskStates({});
      setPhaseColors(newPhaseColors);
      setCurrentProjectIdState(newProjectId);
      setCurrentProjectId(newProjectId);
      setCurrentView('project');

      setShowAIAnalysisModal(false);
      alert(`Project created! Generated ${result.suggestedTasks.length} tasks across ${result.suggestedPhases.length} phases!`);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      alert('Failed to analyze project. Please try again.');
    }
  };

  const handleImport = (newTasks: Task[], _newPhases: any, newPhaseColors: any, metadata?: Partial<ProjectMeta>) => {
    // If we're in dashboard view, create a new project from the import
    if (currentView === 'dashboard') {
      const newProjectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create project metadata from import metadata or defaults
      const newProjectMeta: ProjectMeta = {
        id: newProjectId,
        name: metadata?.name || 'Imported Project',
        description: metadata?.description,
        initialPrompt: metadata?.initialPrompt,
        projectType: metadata?.projectType || 'custom',
        experienceLevel: metadata?.experienceLevel || 'intermediate',
        status: 'active',
        icon: '📥',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        collaborators: metadata?.collaborators,
        lead: metadata?.lead,
        budget: metadata?.budget,
        timeline: metadata?.timeline,
        startDate: metadata?.startDate,
        targetEndDate: metadata?.targetEndDate,
      };

      // Create new project from imported data
      const newProject: SavedProject = {
        meta: newProjectMeta,
        tasks: newTasks,
        taskStates: {},
        phases: Object.keys(newPhaseColors).map(phaseId => ({
          phaseId,
          phaseTitle: phaseId,
          description: '',
          color: newPhaseColors[phaseId],
          typicalDuration: 0,
        })),
      };

      // Save the new project
      saveProjectToStorage(newProject);

      // Load the new project into view
      setProjectMeta(newProjectMeta);
      setTasks(newTasks);
      setTaskStates({});
      setPhaseColors(newPhaseColors);
      setCurrentProjectIdState(newProjectId);
      setCurrentProjectId(newProjectId);
      setCurrentView('project');

      setShowImportModal(false);
      alert(`Project "${newProjectMeta.name}" created from CSV import with ${newTasks.length} tasks!`);
    } else {
      // If we're in project view, add tasks to current project
      newTasks.forEach(task => addTask(task));

      // Merge phase colors
      setPhaseColors({ ...phaseColors, ...newPhaseColors });

      // Update project metadata if provided
      if (metadata && Object.keys(metadata).length > 0) {
        setProjectMeta(prev => ({
          ...prev,
          ...metadata,
          id: prev.id, // Preserve project ID
          createdAt: prev.createdAt, // Preserve creation date
          icon: prev.icon, // Preserve icon
          archived: prev.archived, // Preserve archived status
          // Preserve existing collaborators if not in import
          collaborators: metadata.collaborators || prev.collaborators,
        }));

        const fieldsUpdated = Object.keys(metadata).filter(k => metadata[k as keyof ProjectMeta] !== undefined);
        console.log('Updated project metadata fields:', fieldsUpdated);
      }

      setShowImportModal(false);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(tasks, taskStates, projectMeta, stats);
  };

  const handleExportJSON = () => {
    if (!currentProjectId) {
      alert('No project loaded');
      return;
    }

    const project = getProject(currentProjectId);
    if (!project) {
      alert('Project not found');
      return;
    }

    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectMeta.name || 'project'}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      storageService.clear();
      window.location.reload();
    }
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskState(taskId, 'status', newStatus);
  };

  const handleCheckboxChange = (taskId: string, checked: boolean) => {
    const newStatus: TaskStatus = checked ? 'complete' : 'pending';
    updateTaskState(taskId, 'status', newStatus);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setShowEditTaskModal(true);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    updateTask(updatedTask);
    setTaskToEdit(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const handleToggleSubtasks = (taskId: string) => {
    setExpandedSubtasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleLogSubtaskTime = (taskId: string, subtaskId: string, hours: number) => {
    // Get current user
    const users = getActiveUsers();
    let userId = currentUserId;
    let userName = 'Unknown User';

    // If no current user is set, try to find one or create a default
    if (!userId) {
      if (users.length > 0) {
        userId = users[0].id;
        userName = users[0].name;
        setCurrentUserId(userId);
        localStorage.setItem('current_user_id', userId);
      } else {
        // No users exist, show alert
        alert('Please add users in the User Management section before logging time.');
        return;
      }
    } else {
      const user = users.find(u => u.id === userId);
      if (user) {
        userName = user.name;
      }
    }

    // Find the task and subtask
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks?.find(st => st.id === subtaskId);
    if (!subtask) return;

    // Update subtask actual hours
    const currentActual = subtask.actualHours || 0;
    updateSubtask(taskId, subtaskId, {
      actualHours: currentActual + hours
    });

    // Create time log entry
    if (currentProjectId) {
      createTimeLog({
        projectId: currentProjectId,
        projectName: projectMeta.name,
        taskId: task.id,
        taskName: task.task,
        subtaskId: subtask.id,
        subtaskName: subtask.name,
        userId: userId!,
        userName: userName,
        date: new Date().toISOString().split('T')[0],
        hours: hours,
        notes: `Logged ${hours}h on ${subtask.name}`,
      });
    }
  };

  const handleEditSubtask = (taskId: string, subtaskId: string, updates: Partial<any>) => {
    updateSubtask(taskId, subtaskId, updates);
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    deleteSubtask(taskId, subtaskId);
  };

  const handleSaveProjectInfo = (updatedMeta: ProjectMeta) => {
    setProjectMeta(updatedMeta);
  };

  const handleApplyIterationChanges = (response: IterationResponse) => {
    const updatedTasks = [...tasks];

    response.changes.forEach(change => {
      switch (change.type) {
        case 'add_subtask':
          const taskIndex = updatedTasks.findIndex(t => t.id === change.target);
          if (taskIndex !== -1) {
            const existingSubtasks = updatedTasks[taskIndex].subtasks || [];
            updatedTasks[taskIndex] = {
              ...updatedTasks[taskIndex],
              subtasks: [...existingSubtasks, ...change.data.subtasks],
              subtaskHourMode: change.data.hourMode || 'auto'
            };
          }
          break;

        case 'add_task':
          const newTask: Task = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            task: change.data.task,
            phase: change.data.phase,
            phaseTitle: change.data.phaseTitle,
            category: change.data.category,
            baseEstHours: change.data.baseEstHours,
            adjustedEstHours: change.data.adjustedEstHours || change.data.baseEstHours,
            aiGenerated: true
          };
          updatedTasks.push(newTask);

          // Initialize task state
          setTaskStates(prev => ({
            ...prev,
            [newTask.id]: {
              estHours: newTask.adjustedEstHours,
              actualHours: '0',
              status: 'pending',
              notes: '',
            }
          }));
          break;

        case 'modify_task':
          const modTaskIndex = updatedTasks.findIndex(t => t.id === change.target);
          if (modTaskIndex !== -1) {
            updatedTasks[modTaskIndex] = {
              ...updatedTasks[modTaskIndex],
              ...change.data
            };
          }
          break;

        case 'update_estimate':
          const estTaskIndex = updatedTasks.findIndex(t => t.id === change.target);
          if (estTaskIndex !== -1) {
            updatedTasks[estTaskIndex].baseEstHours = change.data.newEstimate;
            updatedTasks[estTaskIndex].adjustedEstHours = change.data.newEstimate;
          }
          break;

        case 'add_phase':
          // Phase would need to be added to the phases array
          // Not implementing full phase management here
          break;

        case 'add_dependency':
          const depTaskIndex = updatedTasks.findIndex(t => t.id === change.target);
          if (depTaskIndex !== -1) {
            updatedTasks[depTaskIndex].dependencies = [
              ...(updatedTasks[depTaskIndex].dependencies || []),
              ...change.data.dependencies
            ];
          }
          break;
      }
    });

    setTasks(updatedTasks);

    // Update project metadata
    setProjectMeta({
      ...projectMeta,
      updatedAt: new Date().toISOString()
    });

    // Show success message (you could add a toast notification here)
    alert('✅ Project updated successfully!');
  };

  const handleSavePhases = (newPhases: { [key: string]: string }, newPhaseColors: { [key: string]: string }) => {
    setPhaseColors(newPhaseColors);

    // Update all tasks with new phase titles
    tasks.forEach(task => {
      if (newPhases[task.phase] && newPhases[task.phase] !== task.phaseTitle) {
        updateTask({ ...task, phaseTitle: newPhases[task.phase] });
      }
    });
  };

  const handleSaveCategories = (newCategories: string[]) => {
    setCategories(newCategories);
  };

  const handleRestoreVersion = (version: any) => {
    // Restore all project data from the version
    setTasks(version.tasks);
    setTaskStates(version.taskStates);
    setProjectMeta(version.projectMeta);

    // Note: phaseColors, categories, and progressSnapshots are stored in projectMeta
    // or can be added to the version structure if needed
    if (version.phaseColors) {
      setPhaseColors(version.phaseColors);
    }
    if (version.categories) {
      setCategories(version.categories);
    }
    if (version.progressSnapshots) {
      setProgressSnapshots(version.progressSnapshots);
    }
  };

  const handleSaveSnapshot = () => {
    const note = prompt('Add a note for this snapshot (optional):');

    const snapshot: ProgressSnapshot = {
      timestamp: new Date().toISOString(),
      percentComplete,
      totalTasks: stats.overall.total,
      completedTasks: stats.overall.completed,
      inProgressTasks: stats.overall.inProgress,
      blockedTasks: stats.overall.blocked,
      totalEstHours: stats.totalEst,
      totalActualHours: stats.totalActual,
      note: note || undefined,
    };

    setProgressSnapshots([...progressSnapshots, snapshot]);
    alert('Progress snapshot saved!');
  };

  const handleDeleteSnapshot = (timestamp: string) => {
    setProgressSnapshots(progressSnapshots.filter(s => s.timestamp !== timestamp));
  };

  // Drag and drop handlers
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    // Auto-scroll functionality
    const scrollThreshold = 100; // pixels from edge to trigger scroll
    const scrollSpeed = 10; // pixels per frame

    const container = (e.currentTarget as HTMLElement).closest('tbody')?.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseY = e.clientY;

    // Scroll up if near top
    if (mouseY - rect.top < scrollThreshold) {
      container.scrollTop -= scrollSpeed;
    }
    // Scroll down if near bottom
    else if (rect.bottom - mouseY < scrollThreshold) {
      container.scrollTop += scrollSpeed;
    }
  };

  const handleDrop = (targetTaskId: string) => {
    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      setDraggedTaskId(null);
      return;
    }

    const fromIndex = filteredTasks.findIndex(t => t.id === draggedTaskId);
    const toIndex = filteredTasks.findIndex(t => t.id === targetTaskId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedTaskId(null);
      return;
    }

    // Record move in history
    const move: MoveHistory = { taskId: draggedTaskId, fromIndex, toIndex };
    setMoveHistory([...moveHistory, move]);

    // Reorder tasks
    const newTasks = [...filteredTasks];
    const [removed] = newTasks.splice(fromIndex, 1);
    newTasks.splice(toIndex, 0, removed);

    // Update task order in main tasks array
    reorderTasks(newTasks);
    setDraggedTaskId(null);
  };

  const handleUndoMove = () => {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory[moveHistory.length - 1];
    const currentIndex = filteredTasks.findIndex(t => t.id === lastMove.taskId);

    if (currentIndex === -1) return;

    const newTasks = [...filteredTasks];
    const [removed] = newTasks.splice(currentIndex, 1);
    newTasks.splice(lastMove.fromIndex, 0, removed);

    reorderTasks(newTasks);
    setMoveHistory(moveHistory.slice(0, -1));
  };

  const getStatusColor = (status?: TaskStatus) => {
    switch (status) {
      case 'complete': return theme.statusComplete;
      case 'in-progress': return theme.statusInProgress;
      case 'blocked': return theme.statusBlocked;
      case 'on-hold': return theme.textMuted;
      default: return theme.statusPending;
    }
  };

  const getPhaseColor = (phaseId: string) => {
    return phaseColors[phaseId] || theme.accentBlue;
  };

  // ============================================
  // CONDITIONAL RENDERING (After all hooks)
  // ============================================

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.bgPrimary,
        color: theme.textPrimary
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading...</h2>
          <p style={{ color: theme.textMuted }}>Checking authentication</p>
        </div>
      </div>
    );
  }

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    if (showLogin) {
      return (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setAuthError('');
          }}
          error={authError}
        />
      );
    } else {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => {
            setShowLogin(true);
            setAuthError('');
          }}
          error={authError}
        />
      );
    }
  }

  // Conditional rendering: Dashboard vs Project View
  if (currentView === 'dashboard') {
    return (
      <>
        <DevNotes />
        <div style={{
          minHeight: '100vh',
          background: theme.bgPrimary,
          padding: '2rem',
        }}>
          <Dashboard
            key={projectSyncKey}
            onOpenProject={handleOpenProject}
            onNewProject={handleNewProject}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        </div>

        {/* Modals available from dashboard */}
        <NewProjectChoiceModal
          show={showNewProjectChoiceModal}
          onClose={() => setShowNewProjectChoiceModal(false)}
          onChooseAI={handleChooseAISetup}
          onChooseManual={handleChooseManualProject}
          onChooseImportCSV={handleChooseImportCSV}
          onChooseImportJSON={handleChooseImportJSON}
        />

        <CreateBlankProjectModal
          show={showCreateBlankProjectModal}
          onClose={() => setShowCreateBlankProjectModal(false)}
          onCreate={handleCreateBlankProject}
        />

        <AIAnalysisModal
          show={showAIAnalysisModal}
          onClose={() => setShowAIAnalysisModal(false)}
          onAnalysisComplete={handleAIAnalysis}
        />

        <ImportModal
          show={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          existingPhaseColors={{}}
        />

        <ImportProjectModal
          show={showImportProjectModal}
          onClose={() => setShowImportProjectModal(false)}
          onImport={handleImportProject}
        />

        <SettingsModal
          show={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <DevNotes />
      <div style={{
        minHeight: '100vh',
        background: theme.bgPrimary,
        padding: isMobile ? '1rem' : '2rem',
        paddingBottom: isMobile ? '100px' : '2rem', // Extra space for mobile nav
      }}>
        {/* Header with back button */}
        <header style={{ marginBottom: isMobile ? '1rem' : '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          {!isMobile && (
            <button
              onClick={handleBackToDashboard}
              style={{
                padding: '0.5rem 1rem',
                background: theme.accentBlue,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
              }}>
              ← Back to Dashboard
            </button>
          )}
          <h1 style={{
            fontSize: isMobile ? '1.5rem' : '2.5rem',
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {projectMeta.icon || '📋'} {projectMeta.name}
          </h1>
        </div>
        <p style={{ color: theme.textMuted, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          AI-powered project management for ANY type of project
        </p>

        {/* Autosave Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.85rem',
          color: theme.textMuted,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isSaving ? (
              <>
                <span style={{ color: '#FF9800' }}>●</span>
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <span style={{ color: '#4CAF50' }}>●</span>
                <span>Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>
              </>
            ) : (
              <>
                <span style={{ color: '#999' }}>●</span>
                <span>Not saved yet</span>
              </>
            )}
          </div>

          {/* Sync Status Indicator */}
          {isAuthenticated && (
            <SyncIndicator
              status={syncStatus}
              lastSyncTime={lastSyncTime || undefined}
              error={syncError}
            />
          )}

          {/* Autosave Settings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Autosave:</span>
            <select
              value={autoSaveInterval}
              onChange={(e) => setAutoSaveInterval(parseInt(e.target.value))}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.85rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: '#fff',
                cursor: 'pointer',
              }}>
              <option value="0">Disabled</option>
              <option value="1">Every 1 min</option>
              <option value="3">Every 3 min</option>
              <option value="5">Every 5 min</option>
              <option value="10">Every 10 min</option>
            </select>
          </div>

          <button
            onClick={() => handleSave(true)}
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.85rem',
              background: theme.accentGreen,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
            }}>
            💾 Save Now
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.85rem',
              background: '#607D8B',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
            }}>
            ⚙️ Settings
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
              {currentUser?.name || currentUser?.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.85rem',
                background: theme.accentRed,
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
              }}>
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Action Buttons - Hybrid Layout (Hidden on mobile) */}
      {!isMobile && (
      <div style={{ marginBottom: '2rem' }}>
        {/* Row 1 - Primary Actions */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '10px',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setShowAIAnalysisModal(true)}
            style={{
              height: '40px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'filter 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}>
            🤖 AI Setup
          </button>

          <button
            onClick={() => setShowAddTaskModal(true)}
            style={{
              height: '40px',
              padding: '10px 20px',
              background: theme.accentGreen,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'filter 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}>
            ➕ Add Task
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            style={{
              height: '40px',
              padding: '10px 20px',
              background: '#00ACC1',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'filter 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}>
            📥 Import
          </button>

          <button
            onClick={() => setShowProjectInfoModal(true)}
            style={{
              height: '40px',
              padding: '10px 20px',
              background: theme.accentBlue,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'filter 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}>
            ℹ️ Project Info
          </button>

          <button
            onClick={() => setShowIterateProjectModal(true)}
            style={{
              height: '40px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'filter 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}>
            🤖 Iterate with AI
          </button>
        </div>

        {/* Row 2 - Secondary Actions (Dropdowns) */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <DropdownButton
              label="🔧 Tools ▼"
              isOpen={openDropdown === 'tools'}
              onClick={() => setOpenDropdown(openDropdown === 'tools' ? null : 'tools')}
              items={[
                { icon: '👤', label: 'User Management', onClick: () => { setShowUserManagementModal(true); setOpenDropdown(null); } },
                { icon: '👥', label: 'Manage Team', onClick: () => { setShowCollaboratorModal(true); setOpenDropdown(null); } },
                { icon: '📊', label: 'Edit Phases', onClick: () => { setShowPhaseManagementModal(true); setOpenDropdown(null); } },
                { icon: '🏷️', label: 'Edit Categories', onClick: () => { setShowCategoryManagementModal(true); setOpenDropdown(null); } },
              ]}
            />

            <DropdownButton
              label="📊 Data ▼"
              isOpen={openDropdown === 'data'}
              onClick={() => setOpenDropdown(openDropdown === 'data' ? null : 'data')}
              items={[
                { icon: '📋', label: 'Time Log Viewer', onClick: () => { setShowTimeLogViewerModal(true); setOpenDropdown(null); } },
                { icon: '⏱️', label: 'Time Tracking', onClick: () => { setShowTimeTrackingModal(true); setOpenDropdown(null); } },
                { icon: '📸', label: 'Create Snapshot', onClick: () => { handleSaveSnapshot(); setOpenDropdown(null); } },
                { icon: '🔄', label: 'View Versions', onClick: () => { setShowVersionModal(true); setOpenDropdown(null); } },
                { icon: '📜', label: 'View History', onClick: () => { setShowReportsHistoryModal(true); setOpenDropdown(null); } },
                { icon: '📊', label: 'View Analytics', onClick: () => { setShowAnalyticsModal(true); setOpenDropdown(null); } },
              ]}
            />

            <DropdownButton
              label="📤 Export ▼"
              isOpen={openDropdown === 'export'}
              onClick={() => setOpenDropdown(openDropdown === 'export' ? null : 'export')}
              items={[
                { icon: '📄', label: 'Export to CSV', onClick: () => { handleExportCSV(); setOpenDropdown(null); } },
                { icon: '📋', label: 'Export to JSON', onClick: () => { handleExportJSON(); setOpenDropdown(null); } },
              ]}
            />

            {moveHistory.length > 0 && (
              <button
                onClick={handleUndoMove}
                style={{
                  height: '40px',
                  padding: '10px 20px',
                  background: '#2a2a2a',
                  color: '#e0e0e0',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#3a3a3a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#2a2a2a'; }}>
                ↩️ Undo Move
              </button>
            )}
          </div>

          <button
            onClick={handleClearAll}
            style={{
              height: '40px',
              padding: '10px 20px',
              background: '#d32f2f',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginLeft: 'auto',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#b71c1c'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#d32f2f'; }}>
            🗑️ Clear All
          </button>
        </div>
      </div>
      )}

      {/* Project Info */}
      <div style={{
        background: theme.bgSecondary,
        padding: isMobile ? '1rem' : '1.5rem',
        borderRadius: '12px',
        marginBottom: isMobile ? '1rem' : '2rem',
        border: `1px solid ${theme.border}`,
      }}>
        <h2 style={{ marginBottom: '1rem', color: theme.textPrimary }}>
          {projectMeta.name}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <span style={{ color: theme.textMuted }}>Type:</span>
            <span style={{ color: theme.textPrimary, marginLeft: '0.5rem' }}>
              {projectMeta.projectType.replace(/_/g, ' ')}
            </span>
          </div>
          <div>
            <span style={{ color: theme.textMuted }}>Experience:</span>
            <span style={{ color: theme.textPrimary, marginLeft: '0.5rem' }}>
              {projectMeta.experienceLevel}
            </span>
          </div>
          <div>
            <span style={{ color: theme.textMuted }}>Status:</span>
            <span style={{ color: theme.textPrimary, marginLeft: '0.5rem' }}>
              {projectMeta.status}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div style={{
        background: theme.bgSecondary,
        padding: isMobile ? '1rem' : '1.5rem',
        borderRadius: '12px',
        marginBottom: isMobile ? '1rem' : '2rem',
        border: `1px solid ${theme.border}`,
      }}>
        <h3 style={{ marginBottom: '1rem', color: theme.textPrimary }}>Progress Overview</h3>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: theme.textMuted }}>Overall Completion</span>
            <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{percentComplete}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            background: theme.bgTertiary,
            borderRadius: '6px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${percentComplete}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: theme.bgTertiary, borderRadius: '8px' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '600', color: theme.textPrimary }}>
              {stats.overall.total}
            </div>
            <div style={{ color: theme.textMuted, fontSize: '0.9rem' }}>Total</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: theme.bgTertiary, borderRadius: '8px' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '600', color: theme.statusComplete }}>
              {stats.overall.completed}
            </div>
            <div style={{ color: theme.textMuted, fontSize: '0.9rem' }}>Complete</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: theme.bgTertiary, borderRadius: '8px' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '600', color: theme.statusInProgress }}>
              {stats.overall.inProgress}
            </div>
            <div style={{ color: theme.textMuted, fontSize: '0.9rem' }}>In Progress</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: theme.bgTertiary, borderRadius: '8px' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '600', color: theme.statusBlocked }}>
              {stats.overall.blocked}
            </div>
            <div style={{ color: theme.textMuted, fontSize: '0.9rem' }}>Blocked</div>
          </div>
        </div>
      </div>

      {/* Phase Tabs */}
      {Object.keys(phases).length > 0 && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}>
          <button
            onClick={() => setSelectedPhase('all')}
            style={{
              padding: '0.75rem 1.25rem',
              background: selectedPhase === 'all' ? theme.accentBlue : theme.bgSecondary,
              color: selectedPhase === 'all' ? '#fff' : theme.textPrimary,
              border: `1px solid ${selectedPhase === 'all' ? theme.accentBlue : theme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}>
            All Tasks ({tasks.length})
          </button>
          {Object.entries(phases).map(([phaseId, phaseTitle]) => (
            <button
              key={phaseId}
              onClick={() => setSelectedPhase(phaseId)}
              style={{
                padding: '0.75rem 1.25rem',
                background: selectedPhase === phaseId ? getPhaseColor(phaseId) : theme.bgSecondary,
                color: selectedPhase === phaseId ? '#fff' : theme.textPrimary,
                border: `1px solid ${selectedPhase === phaseId ? getPhaseColor(phaseId) : theme.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                whiteSpace: 'nowrap',
              }}>
              {phaseTitle} ({phaseTaskCounts[phaseId] || 0})
            </button>
          ))}
        </div>
      )}

      {/* Status Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ marginRight: '0.75rem', color: theme.textMuted, fontWeight: '600' }}>
          Filter by Status:
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: `1px solid ${theme.border}`,
            background: theme.bgSecondary,
            color: theme.textPrimary,
            cursor: 'pointer',
          }}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="complete">Complete</option>
          <option value="blocked">Blocked</option>
          <option value="on-hold">On Hold</option>
        </select>
      </div>

      {/* Tasks List */}
      <div style={{
        background: theme.bgSecondary,
        padding: isMobile ? '1rem' : '1.5rem',
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
        marginBottom: isMobile ? '80px' : '0', // Add space for mobile nav
      }}>
        <h3 style={{ marginBottom: '1rem', color: theme.textPrimary }}>
          Tasks {filteredTasks.length !== tasks.length && `(${filteredTasks.length} of ${tasks.length})`}
        </h3>

        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: theme.textMuted }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No tasks found!</h3>
            <p>
              {tasks.length === 0
                ? 'Click "AI Setup" to generate a project plan or "Add Task" to create manually'
                : 'Try adjusting your filters'
              }
            </p>
          </div>
        ) : isMobile ? (
          // Mobile card view
          <div>
            {filteredTasks.map((task) => {
              const state = taskStates[task.id] || {};
              return (
                <React.Fragment key={task.id}>
                  <MobileTaskCard
                    task={task}
                    taskState={state}
                    phaseColor={getPhaseColor(task.phase)}
                    onStatusChange={handleStatusChange}
                    onCheckboxChange={handleCheckboxChange}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onToggleSubtasks={handleToggleSubtasks}
                    isSubtasksExpanded={expandedSubtasks.has(task.id)}
                  />
                  {/* Expanded Subtask List for Mobile */}
                  {task.subtasks && task.subtasks.length > 0 && expandedSubtasks.has(task.id) && (
                    <div style={{
                      marginTop: '-12px',
                      marginBottom: '12px',
                      padding: '16px',
                      background: theme.bgTertiary,
                      borderRadius: '0 0 16px 16px',
                      borderTop: `1px solid ${theme.border}`,
                    }}>
                      <SubtaskList
                        subtasks={task.subtasks}
                        onSubtaskToggle={(subtaskId) => toggleSubtaskStatus(task.id, subtaskId)}
                        onLogTime={(subtaskId, hours) => handleLogSubtaskTime(task.id, subtaskId, hours)}
                        onSubtaskEdit={(subtaskId, updates) => handleEditSubtask(task.id, subtaskId, updates)}
                        onSubtaskDelete={(subtaskId) => handleDeleteSubtask(task.id, subtaskId)}
                        showTimeTracking={true}
                        editable={true}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          // Desktop table view
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
                  <th style={{ padding: '1rem', textAlign: 'center', color: theme.textMuted, width: '50px' }}>✓</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: theme.textMuted }}>Task</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: theme.textMuted }}>Phase</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: theme.textMuted }}>Category</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: theme.textMuted }}>Est. Hours</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: theme.textMuted }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const state = taskStates[task.id] || {};
                  return (
                    <React.Fragment key={task.id}>
                      <tr
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(task.id)}
                        style={{
                          borderBottom: `1px solid ${theme.border}`,
                          transition: 'background 0.2s',
                          cursor: 'grab',
                          opacity: draggedTaskId === task.id ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = theme.hover}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={state.status === 'complete'}
                          onChange={(e) => handleCheckboxChange(task.id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            accentColor: theme.accentGreen,
                          }}
                        />
                      </td>
                      <td style={{ padding: '1rem', color: theme.textPrimary }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span>{task.task}</span>
                            {task.criticalPath && (
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                background: theme.accentRed,
                                color: '#fff',
                                fontSize: '0.75rem',
                                borderRadius: '4px',
                                fontWeight: '600',
                              }}>
                                CRITICAL
                              </span>
                            )}
                            {task.assignedTo && (() => {
                            const collab = (projectMeta.collaborators || []).find(c => c.id === task.assignedTo);
                            if (!collab) return null;
                            return (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  padding: '0.25rem 0.6rem',
                                  background: collab.color || theme.accentBlue,
                                  color: '#fff',
                                  fontSize: '0.75rem',
                                  borderRadius: '12px',
                                  fontWeight: '600',
                                }}
                                title={`Assigned to ${collab.name}`}
                              >
                                <span style={{ fontSize: '0.7rem' }}>{collab.initials}</span>
                                <span>{collab.name}</span>
                              </span>
                            );
                          })()}
                        </div>
                        {task.subtasks && task.subtasks.length > 0 && (() => {
                          const completedCount = task.subtasks.filter(st => st.status === 'completed').length;
                          const totalCount = task.subtasks.length;
                          const percentage = (completedCount / totalCount) * 100;
                          const isExpanded = expandedSubtasks.has(task.id);
                          return (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSubtasks(task.id);
                              }}
                              style={{
                                marginTop: '0.5rem',
                                fontSize: '0.75rem',
                                color: theme.textMuted,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                padding: '0.25rem',
                                borderRadius: '4px',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = theme.bgTertiary}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <span style={{ fontSize: '10px', color: theme.accentBlue }}>
                                {isExpanded ? '▼' : '▶'}
                              </span>
                              <span>📋 {completedCount}/{totalCount} subtasks</span>
                              <div style={{
                                width: '80px',
                                height: '4px',
                                background: theme.bgTertiary,
                                borderRadius: '2px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${percentage}%`,
                                  height: '100%',
                                  background: theme.accentGreen,
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                              <span style={{ color: theme.accentBlue, fontWeight: '600' }}>
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.5rem 1rem',
                          background: `${getPhaseColor(task.phase)}22`,
                          color: getPhaseColor(task.phase),
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                        }}>
                          {task.phaseTitle}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: theme.textSecondary }}>
                        {task.category}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: theme.textPrimary, fontWeight: '600' }}>
                        {(() => {
                          // Calculate total estimated and actual hours from subtasks
                          if (task.subtasks && task.subtasks.length > 0) {
                            const totalEst = task.subtasks.reduce((sum, st) => sum + (st.estHours || 0), 0);
                            const totalActual = task.subtasks.reduce((sum, st) => sum + (st.actualHours || 0), 0);

                            if (totalActual > 0) {
                              const isOverEstimate = totalActual > totalEst;
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                  <div style={{ fontSize: '0.75rem', color: theme.textMuted }}>
                                    Est: {totalEst.toFixed(1)}h
                                  </div>
                                  <div style={{
                                    fontSize: '0.85rem',
                                    color: isOverEstimate ? theme.accentRed : theme.accentGreen,
                                    fontWeight: '600'
                                  }}>
                                    Act: {totalActual.toFixed(1)}h
                                  </div>
                                </div>
                              );
                            }
                            return `${totalEst.toFixed(1)}h`;
                          }
                          return `${state.estHours || task.adjustedEstHours}h`;
                        })()}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                          <select
                            value={state.status || 'pending'}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: getStatusColor(state.status),
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              fontWeight: '600',
                              minWidth: '120px',
                            }}>
                            <option value="pending" style={{ background: theme.bgSecondary, color: theme.textPrimary }}>Pending</option>
                            <option value="in-progress" style={{ background: theme.bgSecondary, color: theme.textPrimary }}>In Progress</option>
                            <option value="complete" style={{ background: theme.bgSecondary, color: theme.textPrimary }}>Complete</option>
                            <option value="blocked" style={{ background: theme.bgSecondary, color: theme.textPrimary }}>Blocked</option>
                            <option value="on-hold" style={{ background: theme.bgSecondary, color: theme.textPrimary }}>On Hold</option>
                          </select>
                          <button
                            onClick={() => handleEditTask(task)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: theme.accentBlue,
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: '600',
                            }}>
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: theme.accentRed,
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: '600',
                            }}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Subtask List Row */}
                    {task.subtasks && task.subtasks.length > 0 && expandedSubtasks.has(task.id) && (
                      <tr>
                        <td colSpan={6} style={{ padding: '0 1rem 1rem 1rem', background: theme.bgTertiary }}>
                          <SubtaskList
                            subtasks={task.subtasks}
                            onSubtaskToggle={(subtaskId) => toggleSubtaskStatus(task.id, subtaskId)}
                            onLogTime={(subtaskId, hours) => handleLogSubtaskTime(task.id, subtaskId, hours)}
                            onSubtaskEdit={(subtaskId, updates) => handleEditSubtask(task.id, subtaskId, updates)}
                            onSubtaskDelete={(subtaskId) => handleDeleteSubtask(task.id, subtaskId)}
                            showTimeTracking={true}
                            editable={true}
                          />
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AIAnalysisModal
        show={showAIAnalysisModal}
        onClose={() => setShowAIAnalysisModal(false)}
        onAnalysisComplete={handleAIAnalysis}
      />

      <ImportModal
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        existingPhaseColors={phaseColors}
      />

      <AddTaskModal
        show={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onAddTask={addTask}
        phases={phases}
        categories={categories}
      />

      <EditTaskModal
        show={showEditTaskModal}
        onClose={() => {
          setShowEditTaskModal(false);
          setTaskToEdit(null);
        }}
        onUpdateTask={handleUpdateTask}
        onUpdateTaskState={(taskId: string, state: any) => {
          setTaskStates((prev: any) => ({ ...prev, [taskId]: state }));
        }}
        task={taskToEdit}
        taskState={taskToEdit ? taskStates[taskToEdit.id] || {} : null}
        phases={phases}
        categories={categories}
        collaborators={projectMeta.collaborators || []}
      />

      <ProjectInfoModal
        show={showProjectInfoModal}
        onClose={() => setShowProjectInfoModal(false)}
        onSave={handleSaveProjectInfo}
        projectMeta={projectMeta}
      />

      <IterateProjectModal
        show={showIterateProjectModal}
        onClose={() => setShowIterateProjectModal(false)}
        onApplyChanges={handleApplyIterationChanges}
        project={{
          meta: projectMeta,
          tasks: tasks,
          taskStates: taskStates,
          phases: Object.entries(phases).map(([phaseId, phaseTitle]) => ({
            phaseId,
            phaseTitle,
            description: '',
            color: phaseColors[phaseId] || '#00A3FF',
            typicalDuration: 7
          }))
        }}
      />

      <PhaseManagementModal
        show={showPhaseManagementModal}
        onClose={() => setShowPhaseManagementModal(false)}
        phases={phases}
        phaseColors={phaseColors}
        tasks={tasks}
        onSave={handleSavePhases}
      />

      <CategoryManagementModal
        show={showCategoryManagementModal}
        onClose={() => setShowCategoryManagementModal(false)}
        categories={categories}
        tasks={tasks}
        onSave={handleSaveCategories}
      />

      <ReportsHistoryModal
        show={showReportsHistoryModal}
        onClose={() => setShowReportsHistoryModal(false)}
        snapshots={progressSnapshots}
        onDeleteSnapshot={handleDeleteSnapshot}
      />

      <AnalyticsReportsModal
        show={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        tasks={tasks}
        taskStates={taskStates}
        projectMeta={projectMeta}
        phases={phases}
        phaseColors={phaseColors}
      />

      <CollaboratorManagementModal
        show={showCollaboratorModal}
        onClose={() => setShowCollaboratorModal(false)}
        collaborators={projectMeta.collaborators || []}
        onUpdateCollaborators={(collaborators: Collaborator[]) => {
          setProjectMeta({ ...projectMeta, collaborators });
        }}
      />

      <VersionManagementModal
        show={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        currentData={{
          tasks,
          taskStates,
          projectMeta,
        }}
        onRestore={handleRestoreVersion}
      />

      <SettingsModal
        show={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      <TimeTrackingModal
        show={showTimeTrackingModal}
        onClose={() => setShowTimeTrackingModal(false)}
        tasks={tasks}
        taskStates={taskStates}
        phases={phases}
        phaseColors={phaseColors}
      />

      <UserManagementModal
        show={showUserManagementModal}
        onClose={() => setShowUserManagementModal(false)}
      />

      <TimeLogViewerModal
        show={showTimeLogViewerModal}
        onClose={() => setShowTimeLogViewerModal(false)}
      />

      {/* Footer */}
      <footer style={{ marginTop: '3rem', textAlign: 'center', color: theme.textMuted, fontSize: '0.9rem', marginBottom: isMobile ? '80px' : '0' }}>
        <p>Built with ❤️ using React, TypeScript, and Claude AI</p>
        <p style={{ marginTop: '0.5rem' }}>
          Universal Project Manager - Works for ANY type of project
        </p>
      </footer>
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNav
          onAddTask={() => setShowAddTaskModal(true)}
          onOpenMenu={() => setShowProjectInfoModal(true)}
          onSave={() => handleSave(true)}
          onBack={handleBackToDashboard}
          isSaving={isSaving}
          showBackButton={true}
        />
      )}
    </>
  );
}

export default App;
