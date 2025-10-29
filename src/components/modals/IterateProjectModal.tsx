// ============================================
// Universal Project Manager - Iterate Project Modal
// ============================================

import React, { useState } from 'react';
import Modal from '../Modal';
import { theme } from '../../config/theme';
import type { SavedProject, IterationResponse } from '../../types';
import { aiService } from '../../services/aiService';

interface IterateProjectModalProps {
  project: SavedProject;
  show: boolean;
  onClose: () => void;
  onApplyChanges: (changes: IterationResponse) => void;
}

export function IterateProjectModal({
  project,
  show,
  onClose,
  onApplyChanges
}: IterateProjectModalProps) {
  const [request, setRequest] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<IterationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!request.trim()) {
      setError('Please describe what you want to add or change');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await aiService.iterateProject(request, project);
      setPreview(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (preview) {
      onApplyChanges(preview);
      handleClose();
    }
  };

  const handleClose = () => {
    setRequest('');
    setPreview(null);
    setError(null);
    onClose();
  };

  const handleRegenerate = () => {
    setPreview(null);
    handleGenerate();
  };

  const renderPreview = () => {
    if (!preview) return null;

    const { previewData } = preview;

    return (
      <div style={styles.previewTree}>
        {/* New Subtasks */}
        {previewData.newSubtasks && previewData.newSubtasks.length > 0 && (
          <div style={styles.previewSection}>
            {previewData.newSubtasks.map(({ taskId, subtasks }) => {
              const task = project.tasks.find(t => t.id === taskId);
              return (
                <div key={taskId} style={styles.previewTask}>
                  <strong style={{ color: theme.textPrimary }}>
                    Task: {task?.task || taskId}
                  </strong>
                  <ul style={styles.subtaskList}>
                    {subtasks.slice(0, 5).map((st, i) => (
                      <li key={i} style={{ color: theme.textSecondary }}>
                        ├─ {st.name} {st.estHours ? `(${st.estHours.toFixed(2)} hrs)` : ''}
                      </li>
                    ))}
                    {subtasks.length > 5 && (
                      <li style={{ color: theme.textMuted }}>
                        └─ ... {subtasks.length - 5} more subtasks
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* New Tasks */}
        {previewData.newTasks && previewData.newTasks.length > 0 && (
          <div style={styles.previewSection}>
            <strong style={{ color: theme.textPrimary }}>New Tasks:</strong>
            <ul style={styles.subtaskList}>
              {previewData.newTasks.map((task, i) => (
                <li key={i} style={{ color: theme.textSecondary }}>
                  • {task.task} ({task.baseEstHours} hrs)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      title={preview ? '✨ Preview Changes' : '✨ Iterate Project with AI'}
      show={show}
      onClose={handleClose}
      width="650px"
    >
      {!preview ? (
        // Request Input View
        <div style={styles.container}>
          {/* Project Info */}
          <div style={styles.projectInfo}>
            <h3 style={styles.projectName}>Current Project: {project.meta.name}</h3>
            <p style={styles.projectStats}>
              Tasks: {project.tasks.length} | Phases: {project.phases.length} |
              Total Est: {project.tasks.reduce((sum, t) => sum + (t.adjustedEstHours || 0), 0).toFixed(1)} hours
            </p>
          </div>

          <hr style={styles.divider} />

          {/* Request Label */}
          <label style={styles.label}>
            <strong>💬 What would you like to add or change?</strong>
          </label>

          {/* Examples */}
          <div style={styles.examples}>
            <small style={{ color: theme.textMuted, fontWeight: 600 }}>Examples:</small>
            <ul style={styles.exampleList}>
              <li>"Add 61 subtasks to Import Plan Library"</li>
              <li>"Create testing phase with QA tasks"</li>
              <li>"Break down database migration into smaller tasks"</li>
              <li>"Add OAuth integration to the implementation"</li>
            </ul>
          </div>

          {/* Request Textarea */}
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Describe what you want to add or change..."
            rows={6}
            disabled={isGenerating}
            style={{
              ...styles.textarea,
              opacity: isGenerating ? 0.6 : 1,
              cursor: isGenerating ? 'not-allowed' : 'text'
            }}
          />

          {/* Error Message */}
          {error && (
            <div style={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            <button
              onClick={handleClose}
              disabled={isGenerating}
              style={{
                ...styles.button,
                ...styles.cancelButton,
                opacity: isGenerating ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !request.trim()}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                opacity: (isGenerating || !request.trim()) ? 0.5 : 1
              }}
            >
              {isGenerating ? '🤖 Generating...' : '🤖 Generate'}
            </button>
          </div>
        </div>
      ) : (
        // Preview View
        <div style={styles.container}>
          {/* AI Request Summary */}
          <div style={styles.aiRequest}>
            AI analyzed your request: <em style={{ color: theme.accentBlue }}>"{request}"</em>
          </div>

          <hr style={styles.divider} />

          {/* Changes Summary */}
          <div style={styles.changesSummary}>
            <h3 style={styles.sectionTitle}>📊 Proposed Changes:</h3>
            <p style={{ color: theme.textPrimary, marginBottom: '1rem' }}>
              {preview.explanation}
            </p>

            {preview.previewData.newSubtasks && preview.previewData.newSubtasks.length > 0 && (
              <div style={styles.changeItem}>
                ✅ Add {preview.previewData.newSubtasks.reduce((sum, ns) => sum + ns.subtasks.length, 0)} subtasks
              </div>
            )}

            {preview.previewData.newTasks && preview.previewData.newTasks.length > 0 && (
              <div style={styles.changeItem}>
                ✅ Add {preview.previewData.newTasks.length} new task{preview.previewData.newTasks.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <hr style={styles.divider} />

          {/* Task Preview */}
          <div style={styles.taskPreview}>
            <h3 style={styles.sectionTitle}>📋 Preview:</h3>
            {renderPreview()}
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              onClick={handleClose}
              style={{
                ...styles.button,
                ...styles.cancelButton
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleRegenerate}
              style={{
                ...styles.button,
                ...styles.secondaryButton
              }}
            >
              🔄 Regenerate
            </button>
            <button
              onClick={handleApply}
              style={{
                ...styles.button,
                ...styles.primaryButton
              }}
            >
              ✅ Apply Changes
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  projectInfo: {
    padding: '1rem',
    backgroundColor: theme.bgSecondary,
    borderRadius: '8px',
  },
  projectName: {
    margin: '0 0 0.5rem 0',
    color: theme.textPrimary,
    fontSize: '1.1rem',
  },
  projectStats: {
    margin: 0,
    color: theme.textSecondary,
    fontSize: '0.9rem',
  },
  divider: {
    border: 'none',
    borderTop: `1px solid ${theme.border}`,
    margin: '1rem 0',
  },
  label: {
    display: 'block',
    marginBottom: '0.75rem',
    color: theme.textPrimary,
    fontSize: '1rem',
  },
  examples: {
    padding: '0.75rem',
    backgroundColor: theme.bgTertiary,
    borderRadius: '6px',
    borderLeft: `3px solid ${theme.accentBlue}`,
  },
  exampleList: {
    margin: '0.5rem 0 0 0',
    paddingLeft: '1.5rem',
    color: theme.textSecondary,
    fontSize: '0.9rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    backgroundColor: theme.bgTertiary,
    color: theme.textPrimary,
    fontFamily: 'inherit',
    fontSize: '1rem',
    resize: 'vertical',
    minHeight: '120px',
    outline: 'none',
  },
  errorMessage: {
    padding: '0.75rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    color: '#ef4444',
  },
  aiRequest: {
    padding: '1rem',
    backgroundColor: theme.bgSecondary,
    borderRadius: '8px',
    fontSize: '0.95rem',
    color: theme.textPrimary,
  },
  changesSummary: {
    padding: '1rem',
    backgroundColor: theme.bgTertiary,
    borderRadius: '8px',
  },
  sectionTitle: {
    margin: '0 0 0.75rem 0',
    color: theme.textPrimary,
    fontSize: '1.1rem',
  },
  changeItem: {
    padding: '0.5rem 0',
    color: theme.textPrimary,
  },
  taskPreview: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  previewTree: {
    fontFamily: "'Courier New', monospace",
    fontSize: '0.9rem',
  },
  previewSection: {
    marginBottom: '1rem',
  },
  previewTask: {
    marginBottom: '0.75rem',
  },
  subtaskList: {
    listStyle: 'none',
    paddingLeft: '1rem',
    margin: '0.5rem 0 0 0',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${theme.border}`,
  },
  button: {
    padding: '0.75rem 1.25rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cancelButton: {
    backgroundColor: theme.textMuted,
    color: theme.bgPrimary,
  },
  primaryButton: {
    backgroundColor: theme.accentBlue,
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: theme.bgSecondary,
    color: theme.accentBlue,
    border: `1px solid ${theme.accentBlue}`,
  },
};
