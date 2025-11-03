/**
 * MobileTaskCard Component
 * Mobile-optimized card view for tasks
 * Replaces table view on small screens
 */

import React from 'react';
import { theme } from '../config/theme';
import type { Task, TaskState, TaskStatus } from '../types';

interface MobileTaskCardProps {
  task: Task;
  taskState?: TaskState;
  phaseTitle?: string;
  onEdit?: () => void;
  onStatusChange?: (status: TaskStatus) => void;
  onDelete?: () => void;
}

export const MobileTaskCard: React.FC<MobileTaskCardProps> = ({
  task,
  taskState,
  phaseTitle,
  onEdit,
  onStatusChange,
  onDelete,
}) => {
  const status = taskState?.status || 'not-started';

  // Get status color
  const statusColor = getStatusColor(status);

  return (
    <div
      style={{
        background: theme.bgSecondary,
        border: `1px solid ${theme.border}`,
        borderLeft: `4px solid ${statusColor}`,
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '0.75rem',
        position: 'relative',
      }}
    >
      {/* Header: Task name and status */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.5rem',
          }}
        >
          <h3
            style={{
              margin: 0,
              color: theme.textPrimary,
              fontSize: '1rem',
              fontWeight: '500',
              flex: 1,
              paddingRight: '0.5rem',
            }}
          >
            {task.task}
          </h3>

          {/* Status badge */}
          <span
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '12px',
              background: `${statusColor}22`,
              color: statusColor,
              fontSize: '0.75rem',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              textTransform: 'capitalize',
            }}
          >
            {status.replace('-', ' ')}
          </span>
        </div>

        {/* Phase tag */}
        {phaseTitle && (
          <div
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '4px',
              background: theme.bgTertiary,
              color: theme.textMuted,
              fontSize: '0.75rem',
            }}
          >
            {phaseTitle}
          </div>
        )}
      </div>

      {/* Task details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Category */}
        {task.category && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: theme.textMuted, fontSize: '0.85rem' }}>📁</span>
            <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
              {task.category}
            </span>
          </div>
        )}

        {/* Hours */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: theme.textMuted, fontSize: '0.85rem' }}>⏱️</span>
          <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
            {task.adjustedEstHours}h estimated
            {taskState?.actualHours && ` • ${taskState.actualHours}h actual`}
          </span>
        </div>

        {/* Assigned to */}
        {task.assignedTo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: theme.textMuted, fontSize: '0.85rem' }}>👤</span>
            <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
              {task.assignedTo}
            </span>
          </div>
        )}

        {/* Dependencies */}
        {task.dependencies && task.dependencies.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: theme.textMuted, fontSize: '0.85rem' }}>🔗</span>
            <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
              {task.dependencies.length} {task.dependencies.length === 1 ? 'dependency' : 'dependencies'}
            </span>
          </div>
        )}

        {/* Subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: theme.textMuted, fontSize: '0.85rem' }}>☑️</span>
            <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
              {task.subtasks.filter(st => st.completed).length} / {task.subtasks.length} subtasks
            </span>
          </div>
        )}

        {/* Blocked reason */}
        {status === 'blocked' && taskState?.blockedReason && (
          <div
            style={{
              marginTop: '0.25rem',
              padding: '0.5rem',
              background: `${theme.accentRed}11`,
              borderRadius: '4px',
              borderLeft: `3px solid ${theme.accentRed}`,
            }}
          >
            <span style={{ color: theme.accentRed, fontSize: '0.85rem', fontWeight: '500' }}>
              ⚠️ Blocked: {taskState.blockedReason}
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              flex: 1,
              padding: '10px',
              minHeight: '40px',
              background: theme.bgTertiary,
              color: theme.textPrimary,
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: `all ${theme.transition.fast} ease`,
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.background = theme.active;
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.background = theme.bgTertiary;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Edit
          </button>
        )}

        {onStatusChange && (
          <button
            onClick={() => {
              // Cycle through statuses
              const statuses: TaskStatus[] = ['not-started', 'in-progress', 'complete', 'blocked'];
              const currentIndex = statuses.indexOf(status);
              const nextStatus = statuses[(currentIndex + 1) % statuses.length];
              onStatusChange(nextStatus);
            }}
            style={{
              flex: 1,
              padding: '10px',
              minHeight: '40px',
              background: statusColor,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: `all ${theme.transition.fast} ease`,
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Update Status
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            style={{
              padding: '10px',
              minHeight: '40px',
              minWidth: '40px',
              background: 'transparent',
              color: theme.accentRed,
              border: `1px solid ${theme.accentRed}`,
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: `all ${theme.transition.fast} ease`,
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.background = `${theme.accentRed}22`;
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

// Helper function to get status color
function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'not-started':
      return theme.statusPending;
    case 'in-progress':
      return theme.statusInProgress;
    case 'complete':
      return theme.statusComplete;
    case 'blocked':
      return theme.statusBlocked;
    default:
      return theme.textMuted;
  }
}
