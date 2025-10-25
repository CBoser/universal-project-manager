// ============================================
// Universal Project Manager - Phase Management Modal
// ============================================

import { useState } from 'react';
import { theme } from '../../config/theme';
import Modal from '../Modal';
import type { Task } from '../../types';

interface PhaseManagementModalProps {
  show: boolean;
  onClose: () => void;
  phases: { [key: string]: string }; // phaseId -> phaseTitle
  phaseColors: { [key: string]: string }; // phaseId -> color
  tasks: Task[];
  onSave: (phases: { [key: string]: string }, phaseColors: { [key: string]: string }) => void;
}

const inputStyle = {
  padding: '0.5rem',
  borderRadius: '4px',
  border: `1px solid ${theme.border}`,
  background: theme.bgTertiary,
  color: theme.textPrimary,
  fontSize: '0.9rem',
};

export default function PhaseManagementModal({
  show,
  onClose,
  phases,
  phaseColors,
  tasks,
  onSave,
}: PhaseManagementModalProps) {
  const [localPhases, setLocalPhases] = useState(phases);
  const [localPhaseColors, setLocalPhaseColors] = useState(phaseColors);
  const [newPhaseId, setNewPhaseId] = useState('');
  const [newPhaseTitle, setNewPhaseTitle] = useState('');
  const [newPhaseColor, setNewPhaseColor] = useState('#667eea');

  const phaseEntries = Object.entries(localPhases);

  const handleAddPhase = () => {
    if (!newPhaseId.trim()) {
      alert('Please enter a phase ID');
      return;
    }
    if (!newPhaseTitle.trim()) {
      alert('Please enter a phase title');
      return;
    }
    if (localPhases[newPhaseId]) {
      alert('A phase with this ID already exists');
      return;
    }

    setLocalPhases({
      ...localPhases,
      [newPhaseId]: newPhaseTitle,
    });
    setLocalPhaseColors({
      ...localPhaseColors,
      [newPhaseId]: newPhaseColor,
    });

    // Reset form
    setNewPhaseId('');
    setNewPhaseTitle('');
    setNewPhaseColor('#667eea');
  };

  const handleUpdatePhase = (phaseId: string, newTitle: string) => {
    setLocalPhases({
      ...localPhases,
      [phaseId]: newTitle,
    });
  };

  const handleUpdateColor = (phaseId: string, newColor: string) => {
    setLocalPhaseColors({
      ...localPhaseColors,
      [phaseId]: newColor,
    });
  };

  const handleDeletePhase = (phaseId: string) => {
    // Check if any tasks use this phase
    const tasksInPhase = tasks.filter(task => task.phase === phaseId);
    if (tasksInPhase.length > 0) {
      alert(`Cannot delete this phase. ${tasksInPhase.length} task(s) are assigned to it.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete the phase "${localPhases[phaseId]}"?`)) {
      return;
    }

    const newPhases = { ...localPhases };
    const newColors = { ...localPhaseColors };
    delete newPhases[phaseId];
    delete newColors[phaseId];
    setLocalPhases(newPhases);
    setLocalPhaseColors(newColors);
  };

  const handleSave = () => {
    if (Object.keys(localPhases).length === 0) {
      alert('You must have at least one phase');
      return;
    }
    onSave(localPhases, localPhaseColors);
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose} title="📋 Manage Phases" width="700px">
      {/* Add New Phase */}
      <div style={{
        background: theme.bgTertiary,
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: `1px solid ${theme.border}`,
      }}>
        <h4 style={{ margin: '0 0 1rem 0', color: theme.textPrimary }}>Add New Phase</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto auto', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: theme.textMuted, fontSize: '0.85rem' }}>
              Phase ID
            </label>
            <input
              type="text"
              value={newPhaseId}
              onChange={(e) => setNewPhaseId(e.target.value.replace(/\s/g, '_').toLowerCase())}
              placeholder="e.g., phase1"
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: theme.textMuted, fontSize: '0.85rem' }}>
              Phase Title
            </label>
            <input
              type="text"
              value={newPhaseTitle}
              onChange={(e) => setNewPhaseTitle(e.target.value)}
              placeholder="e.g., Phase 1: Planning"
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: theme.textMuted, fontSize: '0.85rem' }}>
              Color
            </label>
            <input
              type="color"
              value={newPhaseColor}
              onChange={(e) => setNewPhaseColor(e.target.value)}
              style={{ ...inputStyle, width: '60px', cursor: 'pointer' }}
            />
          </div>
          <button
            onClick={handleAddPhase}
            style={{
              padding: '0.5rem 1rem',
              background: theme.accentGreen,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}>
            + Add
          </button>
        </div>
      </div>

      {/* Existing Phases */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: theme.textPrimary }}>Existing Phases</h4>
        {phaseEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: theme.textMuted }}>
            No phases yet. Add one above to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {phaseEntries.map(([phaseId, phaseTitle]) => {
              const taskCount = tasks.filter(task => task.phase === phaseId).length;
              return (
                <div
                  key={phaseId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1.5fr auto auto auto',
                    gap: '0.75rem',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: theme.bgSecondary,
                    borderRadius: '6px',
                    border: `1px solid ${theme.border}`,
                  }}>
                  <div>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      background: theme.bgTertiary,
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: theme.textMuted,
                      fontFamily: 'monospace',
                    }}>
                      {phaseId}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={phaseTitle}
                    onChange={(e) => handleUpdatePhase(phaseId, e.target.value)}
                    style={{ ...inputStyle, width: '100%' }}
                  />
                  <input
                    type="color"
                    value={localPhaseColors[phaseId] || '#667eea'}
                    onChange={(e) => handleUpdateColor(phaseId, e.target.value)}
                    style={{ ...inputStyle, width: '60px', cursor: 'pointer' }}
                  />
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: theme.bgTertiary,
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    color: theme.textSecondary,
                    whiteSpace: 'nowrap',
                  }}>
                    {taskCount} task{taskCount !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => handleDeletePhase(phaseId)}
                    disabled={taskCount > 0}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: taskCount > 0 ? theme.textMuted : theme.accentRed,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: taskCount > 0 ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      opacity: taskCount > 0 ? 0.5 : 1,
                    }}
                    title={taskCount > 0 ? 'Cannot delete phase with tasks' : 'Delete phase'}>
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          onClick={() => {
            setLocalPhases(phases);
            setLocalPhaseColors(phaseColors);
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
            background: theme.accentBlue,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}>
          Save Changes
        </button>
      </div>
    </Modal>
  );
}
