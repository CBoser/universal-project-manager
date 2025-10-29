import React, { useState } from 'react';
import { Subtask, SubtaskStatus } from '../types';

interface SubtaskListProps {
  subtasks: Subtask[];
  onSubtaskToggle: (subtaskId: string) => void;
  onSubtaskEdit?: (subtaskId: string) => void;
  editable?: boolean;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  onSubtaskToggle,
  onSubtaskEdit,
  editable = false
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  const sortedSubtasks = [...subtasks].sort((a, b) => a.order - b.order);
  const completedCount = sortedSubtasks.filter(st => st.status === 'completed').length;
  const totalCount = sortedSubtasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getStatusColor = (status: SubtaskStatus): string => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'in-progress': return '#ffc107';
      case 'blocked': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: SubtaskStatus): string => {
    switch (status) {
      case 'completed': return '✓';
      case 'in-progress': return '⟳';
      case 'blocked': return '⊘';
      default: return '○';
    }
  };

  return (
    <div style={styles.container}>
      <div
        style={styles.header}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={styles.expandIcon}>{expanded ? '▼' : '▶'}</span>
        <span style={styles.headerText}>
          Subtasks ({completedCount}/{totalCount})
        </span>
        <div style={styles.progressBarContainer}>
          <div
            style={{
              ...styles.progressBar,
              width: `${progressPercentage}%`
            }}
          />
        </div>
      </div>

      {expanded && (
        <div style={styles.subtaskList}>
          {sortedSubtasks.map((subtask) => (
            <div
              key={subtask.id}
              style={styles.subtaskItem}
            >
              <input
                type="checkbox"
                checked={subtask.status === 'completed'}
                onChange={() => onSubtaskToggle(subtask.id)}
                style={styles.checkbox}
              />
              <span
                style={{
                  ...styles.statusIcon,
                  color: getStatusColor(subtask.status)
                }}
              >
                {getStatusIcon(subtask.status)}
              </span>
              <span
                style={{
                  ...styles.subtaskName,
                  textDecoration: subtask.status === 'completed' ? 'line-through' : 'none',
                  opacity: subtask.status === 'completed' ? 0.7 : 1
                }}
              >
                {subtask.name}
              </span>
              {subtask.estHours !== undefined && (
                <span style={styles.hours}>{subtask.estHours.toFixed(2)}h</span>
              )}
              {subtask.notes && (
                <span style={styles.notes} title={subtask.notes}>📝</span>
              )}
              {editable && onSubtaskEdit && (
                <button
                  onClick={() => onSubtaskEdit(subtask.id)}
                  style={styles.editButton}
                >
                  Edit
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginTop: '8px',
    marginBottom: '8px',
    marginLeft: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '6px 8px',
    borderRadius: '4px',
    backgroundColor: '#1a1f2e',
    transition: 'background-color 0.2s',
  },
  expandIcon: {
    fontSize: '10px',
    color: '#00A3FF',
    width: '12px',
  },
  headerText: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#b0b8c5',
    minWidth: '120px',
  },
  progressBarContainer: {
    flex: 1,
    height: '6px',
    backgroundColor: '#2a3142',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4caf50',
    transition: 'width 0.3s ease',
  },
  subtaskList: {
    marginTop: '4px',
    marginLeft: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  subtaskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 8px',
    backgroundColor: '#0f1419',
    borderRadius: '3px',
    fontSize: '13px',
  },
  checkbox: {
    cursor: 'pointer',
    width: '16px',
    height: '16px',
  },
  statusIcon: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  subtaskName: {
    flex: 1,
    color: '#e0e6ed',
  },
  hours: {
    fontSize: '12px',
    color: '#00A3FF',
    fontWeight: 500,
    minWidth: '50px',
    textAlign: 'right',
  },
  notes: {
    fontSize: '12px',
    cursor: 'help',
  },
  editButton: {
    padding: '2px 8px',
    fontSize: '11px',
    backgroundColor: '#2a3142',
    color: '#00A3FF',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
};
