// ============================================
// Universal Project Manager - Edit Task Modal
// ============================================

import { useState, useEffect } from 'react';
import { theme } from '../../config/theme';
import Modal from '../Modal';
import { BulkAddSubtasksModal } from './BulkAddSubtasksModal';
import type { Task, TaskState, Collaborator, TimeLog, Subtask, SubtaskHourMode } from '../../types';

interface EditTaskModalProps {
  show: boolean;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  onUpdateTaskState: (taskId: string, state: TaskState) => void;
  task: Task | null;
  taskState: TaskState | null;
  phases: { [key: string]: string }; // phaseId -> phaseTitle
  categories: string[];
  collaborators?: Collaborator[];
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '6px',
  border: `1px solid ${theme.border}`,
  background: theme.bgTertiary,
  color: theme.textPrimary,
  fontSize: '0.95rem',
};

const buttonStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '0.9rem',
};

export default function EditTaskModal({
  show,
  onClose,
  onUpdateTask,
  onUpdateTaskState,
  task,
  taskState,
  phases,
  categories,
  collaborators = [],
}: EditTaskModalProps) {
  // Task fields
  const [taskName, setTaskName] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [estHours, setEstHours] = useState('');
  const [notes, setNotes] = useState('');
  const [criticalPath, setCriticalPath] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');

  // Time logging
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [showAddTimeLog, setShowAddTimeLog] = useState(false);
  const [newLogHours, setNewLogHours] = useState('');
  const [newLogDate, setNewLogDate] = useState('');
  const [newLogNotes, setNewLogNotes] = useState('');

  // Subtask management
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskHourMode, setSubtaskHourMode] = useState<SubtaskHourMode>('manual');
  const [showBulkAddSubtasks, setShowBulkAddSubtasks] = useState(false);

  const phaseEntries = Object.entries(phases);

  // Calculate total logged time
  const totalLoggedHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);

  // Calculate total subtask hours
  const totalSubtaskHours = subtasks.reduce((sum, st) => sum + (st.estHours || 0), 0);

  // Pre-populate form when task changes
  useEffect(() => {
    if (task) {
      setTaskName(task.task);
      setSelectedPhase(task.phase);
      setSelectedCategory(task.category);
      setEstHours(task.adjustedEstHours.toString());
      setNotes(task.notes || '');
      setCriticalPath(task.criticalPath || false);
      setAssignedTo(task.assignedTo || '');
      setSubtasks(task.subtasks || []);
      setSubtaskHourMode(task.subtaskHourMode || 'manual');
    }

    if (taskState) {
      setTimeLogs(taskState.timeLogs || []);
    }

    // Set default date to today for new time logs
    setNewLogDate(new Date().toISOString().split('T')[0]);
  }, [task, taskState]);

  const handleAddTimeLog = () => {
    const hours = parseFloat(newLogHours);
    if (!hours || hours <= 0) {
      alert('Please enter valid hours (greater than 0)');
      return;
    }
    if (!newLogDate) {
      alert('Please select a date');
      return;
    }

    const newLog: TimeLog = {
      id: `log_${Date.now()}`,
      date: newLogDate,
      hours: hours,
      notes: newLogNotes.trim() || undefined,
    };

    const updatedLogs = [...timeLogs, newLog];
    setTimeLogs(updatedLogs);

    // Reset form
    setNewLogHours('');
    setNewLogNotes('');
    setNewLogDate(new Date().toISOString().split('T')[0]);
    setShowAddTimeLog(false);
  };

  const handleDeleteTimeLog = (logId: string) => {
    if (confirm('Delete this time log entry?')) {
      setTimeLogs(timeLogs.filter(log => log.id !== logId));
    }
  };

  const handleBulkAddSubtasks = (newSubtasks: Subtask[]) => {
    setSubtasks([...subtasks, ...newSubtasks]);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.map(st => {
      if (st.id === subtaskId) {
        const newStatus = st.status === 'completed' ? 'pending' : 'completed';
        return {
          ...st,
          status: newStatus,
          completedDate: newStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return st;
    }));
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (confirm('Delete this subtask?')) {
      setSubtasks(subtasks.filter(st => st.id !== subtaskId));
    }
  };

  const handleSave = () => {
    if (!task) return;

    if (!taskName.trim()) {
      alert('Please enter a task name');
      return;
    }
    if (!selectedPhase) {
      alert('Please select a phase');
      return;
    }
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }
    if (!estHours || parseFloat(estHours) <= 0) {
      alert('Please enter a valid estimated hours (greater than 0)');
      return;
    }

    // Calculate final hours based on subtask mode
    let finalEstHours = parseFloat(estHours);
    if (subtaskHourMode === 'auto' && subtasks.length > 0) {
      finalEstHours = totalSubtaskHours;
    }

    // Update task
    const updatedTask: Task = {
      ...task,
      task: taskName,
      phase: selectedPhase,
      phaseTitle: phases[selectedPhase],
      category: selectedCategory,
      adjustedEstHours: finalEstHours,
      criticalPath: criticalPath,
      notes: notes.trim() || undefined,
      assignedTo: assignedTo || undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      subtaskHourMode: subtasks.length > 0 ? subtaskHourMode : undefined,
    };

    onUpdateTask(updatedTask);

    // Update task state with time logs
    if (taskState) {
      const updatedState: TaskState = {
        ...taskState,
        timeLogs: timeLogs,
        actualHours: totalLoggedHours.toFixed(1), // Update legacy field
      };
      onUpdateTaskState(task.id, updatedState);
    }

    onClose();
  };

  if (!task) return null;

  return (
    <Modal show={show} onClose={onClose} title="✏️ Edit Task" width="700px">
      <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>

        {/* Task Name */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
            Task Name <span style={{ color: theme.accentRed }}>*</span>
          </label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter task name..."
            style={inputStyle}
          />
        </div>

        {/* Phase, Category, Assignment */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
              Phase <span style={{ color: theme.accentRed }}>*</span>
            </label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select a phase...</option>
              {phaseEntries.map(([phaseId, phaseTitle]) => (
                <option key={phaseId} value={phaseId}>
                  {phaseTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
              Category <span style={{ color: theme.accentRed }}>*</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select a category...</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
              Assigned To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              style={inputStyle}
            >
              <option value="">Unassigned</option>
              {collaborators.map((collab) => (
                <option key={collab.id} value={collab.id}>
                  {collab.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estimated Hours */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
            Estimated Hours <span style={{ color: theme.accentRed }}>*</span>
          </label>
          <input
            type="number"
            value={estHours}
            onChange={(e) => setEstHours(e.target.value)}
            placeholder="e.g., 8"
            min="0"
            step="0.5"
            style={inputStyle}
          />
        </div>

        {/* Time Tracking Section */}
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          background: theme.bgSecondary,
          borderRadius: '8px',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '1.1rem' }}>⏱️ Time Tracking</h3>
              <div style={{ color: theme.textMuted, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Total Logged: <strong style={{ color: theme.accentBlue }}>{totalLoggedHours.toFixed(1)} hrs</strong>
                {' '} / Est: <strong>{estHours || '0'} hrs</strong>
                {totalLoggedHours > 0 && parseFloat(estHours) > 0 && (
                  <span style={{
                    color: totalLoggedHours > parseFloat(estHours) ? theme.accentRed : theme.accentGreen,
                    marginLeft: '0.5rem'
                  }}>
                    ({totalLoggedHours > parseFloat(estHours) ? '+' : ''}{(totalLoggedHours - parseFloat(estHours)).toFixed(1)} hrs)
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowAddTimeLog(!showAddTimeLog)}
              style={{
                ...buttonStyle,
                background: theme.accentGreen,
                color: '#fff',
              }}
            >
              {showAddTimeLog ? '✕ Cancel' : '+ Log Time'}
            </button>
          </div>

          {/* Add Time Log Form */}
          {showAddTimeLog && (
            <div style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: theme.bgTertiary,
              borderRadius: '6px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: theme.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newLogDate}
                    onChange={(e) => setNewLogDate(e.target.value)}
                    style={{ ...inputStyle, padding: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: theme.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>
                    Hours *
                  </label>
                  <input
                    type="number"
                    value={newLogHours}
                    onChange={(e) => setNewLogHours(e.target.value)}
                    placeholder="e.g., 2.5"
                    min="0"
                    step="0.25"
                    style={{ ...inputStyle, padding: '0.5rem' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: theme.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={newLogNotes}
                  onChange={(e) => setNewLogNotes(e.target.value)}
                  placeholder="What did you work on?"
                  rows={2}
                  style={{
                    ...inputStyle,
                    padding: '0.5rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>
              <button
                onClick={handleAddTimeLog}
                style={{
                  ...buttonStyle,
                  background: theme.accentGreen,
                  color: '#fff',
                  width: '100%',
                }}
              >
                Add Time Entry
              </button>
            </div>
          )}

          {/* Time Log Entries */}
          {timeLogs.length > 0 ? (
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {timeLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                <div
                  key={log.id}
                  style={{
                    padding: '0.75rem',
                    background: theme.bgTertiary,
                    borderRadius: '6px',
                    marginBottom: '0.5rem',
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.25rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '1rem', color: theme.textPrimary, fontWeight: '600', fontSize: '0.95rem' }}>
                        <span>📅 {new Date(log.date).toLocaleDateString()}</span>
                        <span style={{ color: theme.accentBlue }}>⏱️ {log.hours} hrs</span>
                      </div>
                      {log.notes && (
                        <div style={{ color: theme.textMuted, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {log.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTimeLog(log.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: theme.accentRed,
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0',
                        lineHeight: 1,
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: theme.textMuted,
              fontSize: '0.9rem'
            }}>
              No time logged yet. Click "+ Log Time" to add an entry.
            </div>
          )}
        </div>

        {/* Subtask Management Section */}
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          background: theme.bgSecondary,
          borderRadius: '8px',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '1.1rem' }}>📋 Subtasks</h3>
              <div style={{ color: theme.textMuted, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Break down this task into smaller trackable items
                {subtasks.length > 0 && (
                  <span>
                    {' '}- <strong style={{ color: theme.accentBlue }}>
                      {subtasks.filter(st => st.status === 'completed').length}/{subtasks.length}
                    </strong> completed
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowBulkAddSubtasks(true)}
              style={{
                ...buttonStyle,
                background: theme.accentGreen,
                color: '#fff',
              }}
            >
              + Bulk Add
            </button>
          </div>

          {/* Hour Mode Selection */}
          {subtasks.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>
                Hour Calculation Mode:
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: theme.textPrimary }}>
                  <input
                    type="radio"
                    checked={subtaskHourMode === 'manual'}
                    onChange={() => setSubtaskHourMode('manual')}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Manual ({estHours} hrs)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: theme.textPrimary }}>
                  <input
                    type="radio"
                    checked={subtaskHourMode === 'auto'}
                    onChange={() => setSubtaskHourMode('auto')}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Auto-calculate from subtasks ({totalSubtaskHours.toFixed(2)} hrs)</span>
                </label>
              </div>
            </div>
          )}

          {/* Subtask List */}
          {subtasks.length > 0 ? (
            <div>
              {subtasks.sort((a, b) => a.order - b.order).map(subtask => (
                <div
                  key={subtask.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: theme.bgTertiary,
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={subtask.status === 'completed'}
                    onChange={() => handleToggleSubtask(subtask.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{
                    flex: 1,
                    color: theme.textPrimary,
                    textDecoration: subtask.status === 'completed' ? 'line-through' : 'none',
                    opacity: subtask.status === 'completed' ? 0.7 : 1,
                  }}>
                    {subtask.name}
                  </span>
                  {subtask.estHours !== undefined && (
                    <span style={{ color: theme.accentBlue, fontSize: '0.85rem', fontWeight: '600' }}>
                      {subtask.estHours.toFixed(2)}h
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: theme.accentRed,
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '0.25rem',
                    }}
                    title="Delete subtask"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: theme.textMuted,
              fontSize: '0.9rem'
            }}>
              No subtasks yet. Click "+ Bulk Add" to add multiple subtasks at once.
            </div>
          )}
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes or additional details..."
            rows={3}
            style={{
              ...inputStyle,
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Critical Path */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            color: theme.textPrimary,
          }}>
            <input
              type="checkbox"
              checked={criticalPath}
              onChange={(e) => setCriticalPath(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontWeight: '600' }}>Mark as Critical Path</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${theme.border}` }}>
        <button
          onClick={onClose}
          style={{
            ...buttonStyle,
            padding: '0.75rem 1.5rem',
            background: theme.textMuted,
            color: theme.bgPrimary,
          }}>
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            ...buttonStyle,
            padding: '0.75rem 1.5rem',
            background: theme.accentBlue,
            color: '#fff',
          }}>
          Save Changes
        </button>
      </div>

      {/* Bulk Add Subtasks Modal */}
      <BulkAddSubtasksModal
        show={showBulkAddSubtasks}
        onClose={() => setShowBulkAddSubtasks(false)}
        onAdd={handleBulkAddSubtasks}
        taskName={taskName}
        taskEstHours={parseFloat(estHours) || 0}
      />
    </Modal>
  );
}
