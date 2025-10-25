// ============================================
// Universal Project Manager - Add Task Modal
// ============================================

import { useState } from 'react';
import { theme } from '../../config/theme';
import Modal from '../Modal';
import type { Task } from '../../types';

interface AddTaskModalProps {
  show: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
  phases: { [key: string]: string }; // phaseId -> phaseTitle
  categories: string[];
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

export default function AddTaskModal({
  show,
  onClose,
  onAddTask,
  phases,
  categories,
}: AddTaskModalProps) {
  const [taskName, setTaskName] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [estHours, setEstHours] = useState('');
  const [notes, setNotes] = useState('');
  const [criticalPath, setCriticalPath] = useState(false);

  const phaseEntries = Object.entries(phases);

  const handleSave = () => {
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

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      task: taskName,
      phase: selectedPhase,
      phaseTitle: phases[selectedPhase],
      category: selectedCategory,
      adjustedEstHours: parseFloat(estHours),
      criticalPath: criticalPath,
      notes: notes.trim() || undefined,
    };

    onAddTask(newTask);

    // Reset form
    setTaskName('');
    setSelectedPhase('');
    setSelectedCategory('');
    setEstHours('');
    setNotes('');
    setCriticalPath(false);
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose} title="➕ Add New Task" width="600px">
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
      </div>

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

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          onClick={() => {
            setTaskName('');
            setSelectedPhase('');
            setSelectedCategory('');
            setEstHours('');
            setNotes('');
            setCriticalPath(false);
            onClose();
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: theme.textMuted,
            color: theme.bgPrimary,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}>
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '0.75rem 1.5rem',
            background: theme.accentGreen,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}>
          Add Task
        </button>
      </div>
    </Modal>
  );
}
