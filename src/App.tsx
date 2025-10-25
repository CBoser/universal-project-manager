// ============================================
// Universal Project Manager - Main Application
// ============================================

import { useState, useEffect } from 'react';
import { theme } from './config/theme';
import { DEFAULT_PROJECT_META, INITIAL_DELIVERABLES } from './config/constants';
import { useTaskManagement } from './hooks/useTaskManagement';
import { storageService } from './services/storageService';
import { aiService } from './services/aiService';
import { calculateProgress, calculatePercentComplete } from './utils/calculations';
import { exportToCSV } from './utils/csvExport';
import AIAnalysisModal from './components/modals/AIAnalysisModal';
import type { ProjectMeta, AIAnalysisRequest, TaskStatus } from './types';

function App() {
  // Load saved data or use defaults
  const savedData = storageService.load();

  const [projectMeta, setProjectMeta] = useState<ProjectMeta>(
    savedData?.projectMeta || DEFAULT_PROJECT_META
  );

  const {
    tasks,
    taskStates,
    addTask,
    updateTaskState,
  } = useTaskManagement(savedData?.tasks || INITIAL_DELIVERABLES, savedData?.taskStates || {});

  const [phaseColors, setPhaseColors] = useState(savedData?.phaseColors || {});
  const [showAIAnalysisModal, setShowAIAnalysisModal] = useState(false);

  // Calculate statistics
  const stats = calculateProgress(tasks, taskStates);
  const percentComplete = calculatePercentComplete(stats.overall.completed, stats.overall.total);

  // Auto-save every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleSave();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tasks, taskStates, projectMeta, phaseColors]);

  const handleSave = () => {
    storageService.save({
      tasks,
      taskStates,
      projectMeta,
      phaseColors,
      savedAt: new Date().toISOString(),
    });
    alert('Progress saved!');
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
    const statuses: TaskStatus[] = ['pending', 'in-progress', 'complete', 'blocked'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateTaskState(taskId, 'status', nextStatus);
  };

  const getStatusColor = (status?: TaskStatus) => {
    switch (status) {
      case 'complete': return theme.statusComplete;
      case 'in-progress': return theme.statusInProgress;
      case 'blocked': return theme.statusBlocked;
      default: return theme.statusPending;
    }
  };

  const getPhaseColor = (phaseId: string) => {
    return phaseColors[phaseId] || theme.accentBlue;
  };

  return (
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
        gap: '1rem',
        flexWrap: 'wrap',
        marginBottom: '2rem',
      }}>
        <button
          onClick={() => setShowAIAnalysisModal(true)}
          style={{
            padding: '1rem 1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🤖 AI Project Setup
        </button>

        <button
          onClick={handleSave}
          style={{
            padding: '1rem 1.5rem',
            background: theme.accentGreen,
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          💾 Save Progress
        </button>

        <button
          onClick={handleExportCSV}
          style={{
            padding: '1rem 1.5rem',
            background: theme.accentBlue,
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          📊 Export CSV
        </button>

        <button
          onClick={handleClearAll}
          style={{
            padding: '1rem 1.5rem',
            background: theme.accentRed,
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
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
              {projectMeta.projectType.replace('_', ' ')}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: theme.bgTertiary, borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: theme.textPrimary }}>
              {stats.overall.total}
            </div>
            <div style={{ color: theme.textMuted }}>Total Tasks</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: theme.bgTertiary, borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: theme.statusComplete }}>
              {stats.overall.completed}
            </div>
            <div style={{ color: theme.textMuted }}>Completed</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: theme.bgTertiary, borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: theme.statusInProgress }}>
              {stats.overall.inProgress}
            </div>
            <div style={{ color: theme.textMuted }}>In Progress</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: theme.bgTertiary, borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: theme.statusBlocked }}>
              {stats.overall.blocked}
            </div>
            <div style={{ color: theme.textMuted }}>Blocked</div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div style={{
        background: theme.bgSecondary,
        padding: '1.5rem',
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
      }}>
        <h3 style={{ marginBottom: '1rem', color: theme.textPrimary }}>Tasks</h3>

        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: theme.textMuted }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No tasks yet!</h3>
            <p>Click "AI Project Setup" to generate a project plan with tasks</p>
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
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const state = taskStates[task.id] || {};
                  return (
                    <tr
                      key={task.id}
                      style={{
                        borderBottom: `1px solid ${theme.border}`,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = theme.hover}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
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
                          }}
                        >
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

      {/* Footer */}
      <footer style={{ marginTop: '3rem', textAlign: 'center', color: theme.textMuted, fontSize: '0.9rem' }}>
        <p>Built with ❤️ using React, TypeScript, and Claude AI</p>
        <p style={{ marginTop: '0.5rem' }}>
          Universal Project Manager - Works for ANY type of project
        </p>
      </footer>
    </div>
  );
}

export default App;
