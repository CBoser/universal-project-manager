import React, { useState } from 'react';
import Modal from '../Modal';
import { Subtask } from '../../types';

interface BulkAddSubtasksModalProps {
  show: boolean;
  onClose: () => void;
  onAdd: (subtasks: Subtask[]) => void;
  taskName: string;
  taskEstHours?: number;
}

export const BulkAddSubtasksModal: React.FC<BulkAddSubtasksModalProps> = ({
  show,
  onClose,
  onAdd,
  taskName,
  taskEstHours = 0
}) => {
  const [subtaskText, setSubtaskText] = useState('');
  const [hourMode, setHourMode] = useState<'divide' | 'custom' | 'none'>('divide');
  const [hoursPerSubtask, setHoursPerSubtask] = useState('0');

  const handleAdd = () => {
    const lines = subtaskText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      alert('Please enter at least one subtask');
      return;
    }

    let estHoursPerSubtask: number | undefined;

    if (hourMode === 'divide' && taskEstHours > 0) {
      estHoursPerSubtask = taskEstHours / lines.length;
    } else if (hourMode === 'custom') {
      const parsed = parseFloat(hoursPerSubtask);
      if (isNaN(parsed) || parsed < 0) {
        alert('Please enter a valid number of hours');
        return;
      }
      estHoursPerSubtask = parsed;
    } else {
      estHoursPerSubtask = undefined;
    }

    const newSubtasks: Subtask[] = lines.map((line, index) => ({
      id: `subtask-${Date.now()}-${index}`,
      name: line,
      status: 'pending',
      estHours: estHoursPerSubtask,
      order: index,
      notes: '',
      completedDate: undefined
    }));

    onAdd(newSubtasks);
    setSubtaskText('');
    setHoursPerSubtask('0');
    onClose();
  };

  const handleCancel = () => {
    setSubtaskText('');
    setHoursPerSubtask('0');
    onClose();
  };

  const previewCount = subtaskText.split('\n').filter(line => line.trim().length > 0).length;

  return (
    <Modal show={show} onClose={onClose} title="Bulk Add Subtasks">
      <div style={styles.container}>
        <h2 style={styles.title}>Bulk Add Subtasks</h2>
        <p style={styles.subtitle}>
          Adding subtasks to: <strong>{taskName}</strong>
        </p>

        <div style={styles.section}>
          <label style={styles.label}>
            Subtask Names (one per line):
          </label>
          <textarea
            value={subtaskText}
            onChange={(e) => setSubtaskText(e.target.value)}
            placeholder="G17E EDWARD&#10;G17F FROST&#10;G18L LINDSAY&#10;..."
            rows={12}
            style={styles.textarea}
          />
          <div style={styles.preview}>
            {previewCount > 0 && `${previewCount} subtask${previewCount !== 1 ? 's' : ''} will be created`}
          </div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Hour Distribution:</label>

          <div style={styles.radioGroup}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                checked={hourMode === 'divide'}
                onChange={() => setHourMode('divide')}
                style={styles.radio}
              />
              <div style={styles.radioContent}>
                <div style={styles.radioTitle}>Divide task hours evenly</div>
                <div style={styles.radioDescription}>
                  {taskEstHours > 0
                    ? `${taskEstHours} hours ÷ ${previewCount || 1} subtasks = ${(taskEstHours / (previewCount || 1)).toFixed(2)} hours each`
                    : 'Task has no estimated hours'
                  }
                </div>
              </div>
            </label>

            <label style={styles.radioLabel}>
              <input
                type="radio"
                checked={hourMode === 'custom'}
                onChange={() => setHourMode('custom')}
                style={styles.radio}
              />
              <div style={styles.radioContent}>
                <div style={styles.radioTitle}>Custom hours per subtask</div>
                <input
                  type="number"
                  value={hoursPerSubtask}
                  onChange={(e) => setHoursPerSubtask(e.target.value)}
                  min="0"
                  step="0.25"
                  disabled={hourMode !== 'custom'}
                  style={{
                    ...styles.input,
                    opacity: hourMode !== 'custom' ? 0.5 : 1
                  }}
                  placeholder="0.00"
                />
              </div>
            </label>

            <label style={styles.radioLabel}>
              <input
                type="radio"
                checked={hourMode === 'none'}
                onChange={() => setHourMode('none')}
                style={styles.radio}
              />
              <div style={styles.radioContent}>
                <div style={styles.radioTitle}>No hour estimates</div>
                <div style={styles.radioDescription}>
                  I'll add hours to individual subtasks later
                </div>
              </div>
            </label>
          </div>
        </div>

        <div style={styles.actions}>
          <button onClick={handleCancel} style={styles.cancelButton}>
            Cancel
          </button>
          <button
            onClick={handleAdd}
            style={styles.addButton}
            disabled={previewCount === 0}
          >
            Add {previewCount > 0 ? previewCount : ''} Subtask{previewCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    width: '100%',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 600,
    color: '#e0e6ed',
  },
  subtitle: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#b0b8c5',
  },
  section: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#e0e6ed',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '13px',
    fontFamily: 'monospace',
    backgroundColor: '#0f1419',
    color: '#e0e6ed',
    border: '1px solid #2a3142',
    borderRadius: '4px',
    resize: 'vertical',
    outline: 'none',
  },
  preview: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#00A3FF',
    fontWeight: 500,
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#1a1f2e',
    borderRadius: '4px',
    cursor: 'pointer',
    border: '1px solid #2a3142',
  },
  radio: {
    marginTop: '2px',
    cursor: 'pointer',
  },
  radioContent: {
    flex: 1,
  },
  radioTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#e0e6ed',
    marginBottom: '4px',
  },
  radioDescription: {
    fontSize: '12px',
    color: '#b0b8c5',
  },
  input: {
    marginTop: '8px',
    padding: '8px',
    fontSize: '14px',
    backgroundColor: '#0f1419',
    color: '#e0e6ed',
    border: '1px solid #2a3142',
    borderRadius: '4px',
    width: '120px',
    outline: 'none',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  cancelButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    backgroundColor: '#2a3142',
    color: '#e0e6ed',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  addButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    backgroundColor: '#00A3FF',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
