import React, { useState } from 'react';
import { Subtask, SubtaskStatus } from '../types';

interface SubtaskListProps {
  subtasks: Subtask[];
  onSubtaskToggle: (subtaskId: string) => void;
  onSubtaskEdit?: (subtaskId: string) => void;
  onLogTime?: (subtaskId: string, hours: number) => void;
  editable?: boolean;
  showTimeTracking?: boolean;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  onSubtaskToggle,
  onSubtaskEdit,
  onLogTime,
  editable = false,
  showTimeTracking = false
}) => {
  const [expanded, setExpanded] = useState(false);
  const [loggingTimeFor, setLoggingTimeFor] = useState<string | null>(null);
  const [timeInput, setTimeInput] = useState('');

  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  const sortedSubtasks = [...subtasks].sort((a, b) => a.order - b.order);
  const completedCount = sortedSubtasks.filter(st => st.status === 'completed').length;
  const totalCount = sortedSubtasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Calculate total estimated and actual hours
  const totalEstHours = sortedSubtasks.reduce((sum, st) => sum + (st.estHours || 0), 0);
  const totalActualHours = sortedSubtasks.reduce((sum, st) => sum + (st.actualHours || 0), 0);

  const handleLogTime = (subtaskId: string) => {
    const hours = parseFloat(timeInput);
    if (isNaN(hours) || hours <= 0) {
      alert('Please enter a valid number of hours');
      return;
    }
    if (onLogTime) {
      onLogTime(subtaskId, hours);
    }
    setLoggingTimeFor(null);
    setTimeInput('');
  };

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
        {showTimeTracking && (
          <span style={styles.timeTracking}>
            Est: {totalEstHours.toFixed(1)}h | Actual: {totalActualHours.toFixed(1)}h
          </span>
        )}
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
            <div key={subtask.id}>
              <div style={styles.subtaskItem}>
                <input
                  type="checkbox"
                  checked={subtask.status === 'completed'}
                  onChange={() => onSubtaskToggle(subtask.id)}
                  style={styles.checkbox}
                  onClick={(e) => e.stopPropagation()}
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
                {showTimeTracking && (
                  <span style={styles.timeDisplay}>
                    {subtask.estHours !== undefined && (
                      <span style={styles.estHours}>Est: {subtask.estHours.toFixed(2)}h</span>
                    )}
                    <span style={subtask.actualHours !== undefined && subtask.actualHours > (subtask.estHours || 0)
                      ? { ...styles.actualHours, color: '#f44336' }
                      : styles.actualHours
                    }>
                      Act: {(subtask.actualHours || 0).toFixed(2)}h
                    </span>
                  </span>
                )}
                {!showTimeTracking && subtask.estHours !== undefined && (
                  <span style={styles.hours}>{subtask.estHours.toFixed(2)}h</span>
                )}
                {subtask.notes && (
                  <span style={styles.notes} title={subtask.notes}>📝</span>
                )}
                {showTimeTracking && onLogTime && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLoggingTimeFor(subtask.id);
                    }}
                    style={styles.logTimeButton}
                  >
                    + Log Time
                  </button>
                )}
                {editable && onSubtaskEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubtaskEdit(subtask.id);
                    }}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Time Logging Input */}
              {loggingTimeFor === subtask.id && (
                <div style={styles.timeLogInput}>
                  <input
                    type="number"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    placeholder="Hours..."
                    step="0.25"
                    min="0"
                    style={styles.timeInput}
                    autoFocus
                  />
                  <button
                    onClick={() => handleLogTime(subtask.id)}
                    style={styles.logButton}
                  >
                    Log
                  </button>
                  <button
                    onClick={() => {
                      setLoggingTimeFor(null);
                      setTimeInput('');
                    }}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
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
  timeTracking: {
    fontSize: '11px',
    color: '#b0b8c5',
    marginRight: '12px',
    whiteSpace: 'nowrap',
  },
  timeDisplay: {
    display: 'flex',
    gap: '8px',
    fontSize: '11px',
    marginLeft: 'auto',
  },
  estHours: {
    color: '#00A3FF',
    fontWeight: 500,
  },
  actualHours: {
    color: '#4caf50',
    fontWeight: 500,
  },
  notes: {
    fontSize: '12px',
    cursor: 'help',
  },
  logTimeButton: {
    padding: '2px 8px',
    fontSize: '10px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginLeft: '8px',
  },
  editButton: {
    padding: '2px 8px',
    fontSize: '11px',
    backgroundColor: '#2a3142',
    color: '#00A3FF',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginLeft: '4px',
  },
  timeLogInput: {
    display: 'flex',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#0b0f14',
    borderRadius: '4px',
    marginTop: '4px',
    marginLeft: '32px',
    alignItems: 'center',
  },
  timeInput: {
    width: '80px',
    padding: '4px 8px',
    fontSize: '12px',
    backgroundColor: '#1a1f2e',
    color: '#e0e6ed',
    border: '1px solid #2a3142',
    borderRadius: '3px',
    outline: 'none',
  },
  logButton: {
    padding: '4px 12px',
    fontSize: '11px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '4px 12px',
    fontSize: '11px',
    backgroundColor: '#2a3142',
    color: '#e0e6ed',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
};
