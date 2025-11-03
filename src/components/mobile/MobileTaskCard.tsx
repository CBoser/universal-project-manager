/**
 * MobileTaskCard Component
 * Card-based task display optimized for mobile devices
 *
 * Features:
 * - Card layout with swipe gestures
 * - Touch-friendly controls
 * - Expandable details
 * - Status indicators with colors
 * - Subtask progress
 */

import React, { useState } from 'react';
import { theme } from '../../config/theme';
import { TouchButton } from './TouchButton';
import type { Task, TaskStatus, TaskState } from '../../types';

export interface MobileTaskCardProps {
  task: Task;
  taskState: TaskState;
  phaseColor: string;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onCheckboxChange: (taskId: string, checked: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtasks?: (taskId: string) => void;
  isSubtasksExpanded?: boolean;
}

export const MobileTaskCard: React.FC<MobileTaskCardProps> = ({
  task,
  taskState,
  phaseColor,
  onStatusChange,
  onCheckboxChange,
  onEdit,
  onDelete,
  onToggleSubtasks,
  isSubtasksExpanded = false,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);

  const cardStyles: React.CSSProperties = {
    position: 'relative',
    background: theme.bgTertiary,
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '12px',
    border: `1px solid ${theme.border}`,
    transition: `transform ${theme.transition.normal} ease`,
    transform: `translateX(${swipeDistance}px)`,
    WebkitTapHighlightColor: 'transparent',
  };

  const statusColors: Record<TaskStatus, string> = {
    pending: theme.statusPending,
    'in-progress': theme.statusInProgress,
    complete: theme.statusComplete,
    blocked: theme.statusBlocked,
    'on-hold': theme.textMuted,
  };

  const getStatusColor = (status?: TaskStatus) => {
    return statusColors[status || 'pending'];
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;

    // Only allow swiping left (negative values)
    if (diff < 0 && diff > -100) {
      setSwipeDistance(diff);
    }
  };

  const handleTouchEnd = () => {
    if (swipeDistance < -50) {
      setShowActions(true);
    }
    setSwipeDistance(0);
    setTouchStartX(null);
  };

  // Calculate subtask progress
  const subtaskProgress = task.subtasks
    ? {
        completed: task.subtasks.filter((st) => st.status === 'completed').length,
        total: task.subtasks.length,
        percentage:
          (task.subtasks.filter((st) => st.status === 'completed').length /
            task.subtasks.length) *
          100,
      }
    : null;

  return (
    <div
      style={cardStyles}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Phase badge */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '4px 12px',
          background: `${phaseColor}20`,
          color: phaseColor,
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600',
        }}
      >
        {task.phaseTitle}
      </div>

      {/* Task header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <input
          type="checkbox"
          checked={taskState.status === 'complete'}
          onChange={(e) => onCheckboxChange(task.id, e.target.checked)}
          style={{
            width: '24px',
            height: '24px',
            marginTop: '2px',
            cursor: 'pointer',
            accentColor: theme.accentGreen,
          }}
        />
        <div style={{ flex: 1 }}>
          <h4
            style={{
              color: theme.textPrimary,
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '8px',
              paddingRight: '80px', // Make room for phase badge
              lineHeight: '1.4',
            }}
          >
            {task.task}
          </h4>

          {/* Badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            {task.criticalPath && (
              <span
                style={{
                  padding: '4px 8px',
                  background: theme.accentRed,
                  color: '#fff',
                  fontSize: '0.7rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                }}
              >
                CRITICAL
              </span>
            )}
            {task.category && (
              <span
                style={{
                  padding: '4px 8px',
                  background: theme.bgSecondary,
                  color: theme.textSecondary,
                  fontSize: '0.7rem',
                  borderRadius: '8px',
                }}
              >
                {task.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <span style={{ color: theme.textMuted, fontSize: '0.85rem' }}>Status:</span>
        <select
          value={taskState.status || 'pending'}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: getStatusColor(taskState.status),
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="complete">Complete</option>
          <option value="blocked">Blocked</option>
          <option value="on-hold">On Hold</option>
        </select>
      </div>

      {/* Hours estimate */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 0',
          borderTop: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}`,
          marginBottom: '12px',
        }}
      >
        <span style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
          Estimated Hours
        </span>
        <span
          style={{
            color: theme.textPrimary,
            fontSize: '1rem',
            fontWeight: '600',
          }}
        >
          {taskState.estHours || task.adjustedEstHours}h
        </span>
      </div>

      {/* Subtasks progress */}
      {subtaskProgress && subtaskProgress.total > 0 && (
        <div
          onClick={() => onToggleSubtasks && onToggleSubtasks(task.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px',
            background: theme.bgSecondary,
            borderRadius: '8px',
            marginBottom: '12px',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: theme.accentBlue }}>
            {isSubtasksExpanded ? '▼' : '▶'}
          </span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
                📋 Subtasks
              </span>
              <span style={{ color: theme.textPrimary, fontSize: '0.85rem' }}>
                {subtaskProgress.completed}/{subtaskProgress.total}
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                background: theme.bgTertiary,
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${subtaskProgress.percentage}%`,
                  height: '100%',
                  background: theme.accentGreen,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {showActions ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <TouchButton
            variant="secondary"
            size="small"
            icon="✏️"
            onClick={() => {
              onEdit(task);
              setShowActions(false);
            }}
            fullWidth
          >
            Edit
          </TouchButton>
          <TouchButton
            variant="danger"
            size="small"
            icon="🗑️"
            onClick={() => {
              onDelete(task.id);
              setShowActions(false);
            }}
            fullWidth
          >
            Delete
          </TouchButton>
          <TouchButton
            variant="ghost"
            size="small"
            icon="✕"
            onClick={() => setShowActions(false)}
          >
            Cancel
          </TouchButton>
        </div>
      ) : (
        <TouchButton
          variant="ghost"
          size="small"
          fullWidth
          onClick={() => setShowActions(true)}
        >
          Actions
        </TouchButton>
      )}
    </div>
  );
};
