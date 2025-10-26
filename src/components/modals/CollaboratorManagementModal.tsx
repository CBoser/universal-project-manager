// ============================================
// Universal Project Manager - Collaborator Management Modal
// ============================================

import { useState, useEffect } from 'react';
import { theme } from '../../config/theme';
import Modal from '../Modal';
import type { Collaborator } from '../../types';

interface CollaboratorManagementModalProps {
  show: boolean;
  onClose: () => void;
  collaborators: Collaborator[];
  onUpdateCollaborators: (collaborators: Collaborator[]) => void;
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

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#52B788', '#F08080', '#20B2AA', '#DDA15E'
];

export default function CollaboratorManagementModal({
  show,
  onClose,
  collaborators,
  onUpdateCollaborators,
}: CollaboratorManagementModalProps) {
  const [localCollaborators, setLocalCollaborators] = useState<Collaborator[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    setLocalCollaborators([...collaborators]);
  }, [collaborators, show]);

  const generateInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleAdd = () => {
    if (!newName.trim()) {
      alert('Please enter a name');
      return;
    }

    const newCollaborator: Collaborator = {
      id: `collab_${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim() || undefined,
      role: newRole.trim() || undefined,
      color: selectedColor,
      initials: generateInitials(newName.trim()),
    };

    setLocalCollaborators([...localCollaborators, newCollaborator]);
    setNewName('');
    setNewEmail('');
    setNewRole('');
    setSelectedColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this collaborator? This will unassign them from all tasks.')) {
      setLocalCollaborators(localCollaborators.filter(c => c.id !== id));
    }
  };

  const handleSave = () => {
    onUpdateCollaborators(localCollaborators);
    onClose();
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="👥 Manage Collaborators"
      width="600px"
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: theme.textMuted, margin: 0, marginBottom: '1rem' }}>
          Add team members to assign tasks and track who's working on what.
        </p>

        {/* Add Collaborator Form */}
        <div style={{
          padding: '1rem',
          background: theme.bgSecondary,
          borderRadius: '8px',
          border: `1px solid ${theme.border}`,
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: theme.textPrimary }}>Add New Collaborator</h3>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600', fontSize: '0.9rem' }}>
              Name <span style={{ color: theme.accentRed }}>*</span>
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., John Doe"
              style={inputStyle}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600', fontSize: '0.9rem' }}>
                Email (Optional)
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="john@example.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600', fontSize: '0.9rem' }}>
                Role (Optional)
              </label>
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="e.g., Developer"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600', fontSize: '0.9rem' }}>
              Avatar Color
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: color,
                    border: selectedColor === color ? `3px solid ${theme.textPrimary}` : `2px solid ${theme.border}`,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title={color}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: theme.accentGreen,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
            }}
          >
            + Add Collaborator
          </button>
        </div>

        {/* Collaborator List */}
        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: theme.textPrimary }}>
            Team Members ({localCollaborators.length})
          </h3>

          {localCollaborators.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: theme.bgSecondary,
              borderRadius: '8px',
              color: theme.textMuted,
            }}>
              No collaborators yet. Add team members above.
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {localCollaborators.map((collab) => (
                <div
                  key={collab.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: theme.bgSecondary,
                    borderRadius: '8px',
                    marginBottom: '0.75rem',
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: collab.color || theme.accentBlue,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: '#fff',
                      fontSize: '1.1rem',
                      flexShrink: 0,
                    }}
                  >
                    {collab.initials}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '600',
                      color: theme.textPrimary,
                      fontSize: '1rem',
                      marginBottom: '0.25rem',
                    }}>
                      {collab.name}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: theme.textMuted,
                    }}>
                      {collab.role && <span>{collab.role}</span>}
                      {collab.role && collab.email && <span> • </span>}
                      {collab.email && <span>{collab.email}</span>}
                      {!collab.role && !collab.email && <span>No details</span>}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(collab.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: theme.accentRed,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: `1px solid ${theme.border}` }}>
        <button
          onClick={() => {
            setLocalCollaborators([...collaborators]);
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
          }}
        >
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
          }}
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
}
