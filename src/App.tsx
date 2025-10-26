// ============================================
// Universal Project Manager - Main Application
// ============================================

import { useState, useEffect } from 'react';
import { theme } from './config/theme';
import { DEFAULT_PROJECT_META, DEFAULT_CATEGORIES } from './config/constants';
import { useTaskManagement } from './hooks/useTaskManagement';
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
import DevNotes from './components/dev/DevNotes';
import type { ProjectMeta, AIAnalysisRequest, TaskStatus, Task } from './types';

interface MoveHistory {
  taskId: string;
  fromIndex: number;
  toIndex: number;
}

function App() {
  // Load saved data or use defaults
  const savedData = storageService.load();

  const [projectMeta, setProjectMeta] = useState<ProjectMeta>(
    savedData?.projectMeta || DEFAULT_PROJECT_META
  );

  const {
    tasks,
    taskStates,
    setTaskStates,
    addTask,
    updateTask,
    deleteTask,
    updateTaskState,
    reorderTasks,
  } = useTaskManagement(savedData?.tasks || [], savedData?.taskStates || {});

  const [phaseColors, setPhaseColors] = useState(savedData?.phaseColors || {});
  const [categories, setCategories] = useState<string[]>(savedData?.categories || DEFAULT_CATEGORIES);
  const [progressSnapshots, setProgressSnapshots] = useState<ProgressSnapshot[]>(savedData?.progressSnapshots || []);
  const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([]);

  // Modal states
  const [showAIAnalysisModal, setShowAIAnalysisModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showProjectInfoModal, setShowProjectInfoModal] = useState(false);
  const [showPhaseManagementModal, setShowPhaseManagementModal] = useState(false);
  const [showCategoryManagementModal, setShowCategoryManagementModal] = useState(false);
  const [showReportsHistoryModal, setShowReportsHistoryModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // Task editing
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Phase tabs
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  // Status filter
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  // Drag and drop
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

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

  // Auto-save every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleSave(false);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tasks, taskStates, projectMeta, phaseColors, categories, progressSnapshots]);

  const handleSave = (showAlert: boolean = true) => {
    storageService.save({
      tasks,
      taskStates,
      projectMeta,
      phaseColors,
      categories,
      progressSnapshots,
      savedAt: new Date().toISOString(),
    });
    if (showAlert) {
      alert('Progress saved!');
    }
  };

  const handleAIAnalysis = async (request: AIAnalysisRequest, useRealAI: boolean) => {
    try {
      const service = useRealAI ? aiService : aiService; // Will use mock if no API key
      const result = await service.analyzeProjectAndGenerateTasks(request);

      // Apply phases
      const newPhaseColors = { ...phaseColors };
      result.suggestedPhases.forEach(phase => {
        newPhaseColors[phase.phaseId] = phase.color;
      });
      setPhaseColors(newPhaseColors);

      // Apply tasks
      result.suggestedTasks.forEach(task => {
        addTask(task);
      });

      // Update project meta
      setProjectMeta(prev => ({
        ...prev,
        projectType: request.projectType,
        experienceLevel: request.experienceLevel,
        description: request.projectDescription,
        name: request.projectDescription.substring(0, 50) + (request.projectDescription.length > 50 ? '...' : ''),
      }));

      alert(`Successfully generated ${result.suggestedTasks.length} tasks across ${result.suggestedPhases.length} phases!`);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      alert('Failed to analyze project. Please try again.');
    }
  };

  const handleImport = (newTasks: Task[], _newPhases: any, newPhaseColors: any) => {
    // Add all imported tasks
    newTasks.forEach(task => addTask(task));

    // Merge phase colors
    setPhaseColors({ ...phaseColors, ...newPhaseColors });
  };

  const handleExportCSV = () => {
    exportToCSV(tasks, taskStates, projectMeta, stats);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      storageService.clear();
      window.location.reload();
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    const currentStatus = taskStates[taskId]?.status || 'pending';
    const statuses: TaskStatus[] = ['pending', 'in-progress', 'complete', 'blocked', 'on-hold'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateTaskState(taskId, 'status', nextStatus);
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

  const handleSaveProjectInfo = (updatedMeta: ProjectMeta) => {
    setProjectMeta(updatedMeta);
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

  return (
    <>
      <DevNotes />
      <div style={{
        minHeight: '100vh',
        background: theme.bgPrimary,
        padding: '2rem',
      }}>
        {/* Header */}
        <header style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          🚀 Universal Project Manager
        </h1>
        <p style={{ color: theme.textMuted, fontSize: '1.1rem' }}>
          AI-powered project management for ANY type of project
        </p>
      </header>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        marginBottom: '2rem',
      }}>
        <button
          onClick={() => setShowAIAnalysisModal(true)}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
          🤖 AI Setup
        </button>

        <button
          onClick={() => setShowProjectInfoModal(true)}
          style={{
            padding: '0.75rem 1.25rem',
            background: theme.accentBlue,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
          ℹ️ Project Info
        </button>

        <button
          onClick={() => setShowAddTaskModal(true)}
          style={{
            padding: '0.75rem 1.25rem',
            background: theme.accentGreen,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
          ➕ Add Task
        </button>

        <button
          onClick={() => setShowImportModal(true)}
          style={{
            padding: '0.75rem 1.25rem',
            background: theme.accentBlue,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
          📥 Import
        </button>

        <button
          onClick={() => setShowPhaseManagementModal(true)}
          style={{
            padding: '0.75rem 1.25rem',
            background: theme.textSecondary,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
          📋 Phases
        </button>

        <button
          onClick={() => setShowCategoryManagementModal(true)}
          style={{
            padding: '0.75rem 1.25rem',
            background: theme.textSecondary,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
          🏷️ Categories
        </button>

        <button
          onClick={() => handleSave()}
          style={{
            padding: '0.75rem 1.25rem',
            background: theme.accentGreen,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
          💾 Save
        </button>

        <button
          onClick={handleSaveSnapshot}
          style={{
            padding: '0.75rem 1.25rem',
            background: theme.brandOrange,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
          📊 Snapshot
        </button>

        <button
          onClick={() => setShowReportsHistoryModal(true)}
          style={{
            padding: '0.75rem 1.25rem',
            background: theme.brandOrange,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
          📈 History
        </button>

        <button
          onClick={() => setShowAnalyticsModal(true)}
          style={{
            padding: '0.75rem 1.25rem',
            background: '#2196f3',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
          📊 Analytics
        </button>

        <button
          onClick={handleExportCSV}
          style={{
            padding: '0.75rem 1.25rem',
            background: theme.accentBlue,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
          📊 Export
        </button>

        {moveHistory.length > 0 && (
          <button
            onClick={handleUndoMove}
            style={{
              padding: '0.75rem 1.25rem',
              background: theme.textSecondary,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}>
            ↩️ Undo Move
          </button>
        )}

        <button
          onClick={handleClearAll}
          style={{
            padding: '0.75rem 1.25rem',
            background: theme.accentRed,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
          🗑️ Clear All
        </button>
      </div>

      {/* Project Info */}
      <div style={{
        background: theme.bgSecondary,
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
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
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
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
        padding: '1.5rem',
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
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
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: theme.textMuted }}>Status</th>
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
                    <tr
                      key={task.id}
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
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: getStatusColor(state.status),
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                          }}>
                          {state.status || 'pending'}
                        </button>
                      </td>
                      <td style={{ padding: '1rem', color: theme.textPrimary }}>
                        {task.task}
                        {task.criticalPath && (
                          <span style={{
                            marginLeft: '0.5rem',
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
                        {state.estHours || task.adjustedEstHours}h
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
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

      {/* Footer */}
      <footer style={{ marginTop: '3rem', textAlign: 'center', color: theme.textMuted, fontSize: '0.9rem' }}>
        <p>Built with ❤️ using React, TypeScript, and Claude AI</p>
        <p style={{ marginTop: '0.5rem' }}>
          Universal Project Manager - Works for ANY type of project
        </p>
      </footer>
      </div>
    </>
  );
}

export default App;
