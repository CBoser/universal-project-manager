import React, { useState, useEffect } from 'react';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  generateInitials,
  generateUserColor,
  exportUsers,
  importUsers,
  User
} from '../../services/userService';
import { getAllTimeLogs } from '../../services/timeLogService';

interface UserManagementModalProps {
  show: boolean;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  show,
  onClose,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    color: generateUserColor(),
  });

  useEffect(() => {
    if (show) {
      loadUsers();
    }
  }, [show]);

  const loadUsers = () => {
    setUsers(getAllUsers());
  };

  const getUserStats = (userId: string) => {
    const logs = getAllTimeLogs().filter(l => l.userId === userId);
    const totalHours = logs.reduce((sum, l) => sum + l.hours, 0);
    const projects = new Set(logs.map(l => l.projectId)).size;

    return { totalHours, projectCount: projects, logCount: logs.length };
  };

  const handleAdd = () => {
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    const initials = generateInitials(formData.name);

    createUser({
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      role: formData.role.trim() || undefined,
      initials,
      color: formData.color,
      active: true,
    });

    setFormData({ name: '', email: '', role: '', color: generateUserColor() });
    setShowAddForm(false);
    loadUsers();
  };

  const handleUpdate = () => {
    if (!editingUser) return;

    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    const initials = generateInitials(formData.name);

    updateUser(editingUser.id, {
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      role: formData.role.trim() || undefined,
      initials,
      color: formData.color,
    });

    setEditingUser(null);
    setFormData({ name: '', email: '', role: '', color: generateUserColor() });
    loadUsers();
  };

  const handleDelete = (userId: string) => {
    const stats = getUserStats(userId);
    if (stats.logCount > 0) {
      if (!confirm(`This user has ${stats.logCount} time log entries. Are you sure you want to delete them? This cannot be undone.`)) {
        return;
      }
    } else {
      if (!confirm('Are you sure you want to delete this user?')) {
        return;
      }
    }

    deleteUser(userId);
    loadUsers();
  };

  const handleToggleActive = (user: User) => {
    updateUser(user.id, { active: !user.active });
    loadUsers();
  };

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email || '',
      role: user.role || '',
      color: user.color,
    });
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setShowAddForm(false);
    setFormData({ name: '', email: '', role: '', color: generateUserColor() });
  };

  const handleExport = () => {
    const json = exportUsers();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          const success = importUsers(event.target.result);
          if (success) {
            alert('Users imported successfully!');
            loadUsers();
          } else {
            alert('Failed to import users. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (!show) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>👥 User Management</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.content}>
          {/* Action Buttons */}
          <div style={styles.actionBar}>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingUser(null);
                setFormData({ name: '', email: '', role: '', color: generateUserColor() });
              }}
              style={styles.btnAdd}>
              + Add User
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleImport} style={styles.btnSecondary}>
                📥 Import
              </button>
              <button onClick={handleExport} style={styles.btnSecondary}>
                📤 Export
              </button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {(showAddForm || editingUser) && (
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Developer"
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      style={styles.colorInput}
                    />
                    <button
                      onClick={() => setFormData({ ...formData, color: generateUserColor() })}
                      style={styles.btnSmall}>
                      Random
                    </button>
                  </div>
                </div>
              </div>
              <div style={styles.formActions}>
                {editingUser ? (
                  <button onClick={handleUpdate} style={styles.btnSave}>
                    Save Changes
                  </button>
                ) : (
                  <button onClick={handleAdd} style={styles.btnSave}>
                    Add User
                  </button>
                )}
                <button onClick={handleCancelEdit} style={styles.btnCancel}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Users List */}
          <div style={styles.usersList}>
            <h3 style={styles.sectionTitle}>
              All Users ({users.length})
            </h3>
            {users.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>👤</div>
                <p>No users yet. Add your first team member!</p>
              </div>
            ) : (
              <div style={styles.userCards}>
                {users.map(user => {
                  const stats = getUserStats(user.id);
                  return (
                    <div key={user.id} style={styles.userCard}>
                      <div style={styles.userHeader}>
                        <div
                          style={{
                            ...styles.userAvatar,
                            backgroundColor: user.color,
                          }}
                        >
                          {user.initials}
                        </div>
                        <div style={styles.userInfo}>
                          <div style={styles.userName}>
                            {user.name}
                            {!user.active && (
                              <span style={styles.inactiveBadge}>Inactive</span>
                            )}
                          </div>
                          {user.email && (
                            <div style={styles.userEmail}>{user.email}</div>
                          )}
                          {user.role && (
                            <div style={styles.userRole}>{user.role}</div>
                          )}
                        </div>
                      </div>

                      <div style={styles.userStats}>
                        <div style={styles.stat}>
                          <div style={styles.statValue}>{stats.totalHours.toFixed(1)}h</div>
                          <div style={styles.statLabel}>Total Hours</div>
                        </div>
                        <div style={styles.stat}>
                          <div style={styles.statValue}>{stats.projectCount}</div>
                          <div style={styles.statLabel}>Projects</div>
                        </div>
                        <div style={styles.stat}>
                          <div style={styles.statValue}>{stats.logCount}</div>
                          <div style={styles.statLabel}>Time Logs</div>
                        </div>
                      </div>

                      <div style={styles.userActions}>
                        <button
                          onClick={() => handleStartEdit(user)}
                          style={styles.btnEdit}>
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          style={user.active ? styles.btnDeactivate : styles.btnActivate}>
                          {user.active ? '⏸️ Deactivate' : '▶️ Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          style={styles.btnDelete}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.btnClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#0f1419',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '1000px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '1px solid #2a3142',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #2a3142',
  },
  title: {
    margin: 0,
    color: '#e0e6ed',
    fontSize: '1.5rem',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#b0b8c5',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '8px',
  },
  btnAdd: {
    padding: '0.5rem 1rem',
    background: '#00A3FF',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '0.5rem 1rem',
    background: '#2a3142',
    color: '#e0e6ed',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  formCard: {
    background: '#1a1f2e',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    border: '1px solid #2a3142',
  },
  formTitle: {
    margin: '0 0 1rem 0',
    color: '#e0e6ed',
    fontSize: '1.1rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    color: '#b0b8c5',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  input: {
    padding: '0.5rem',
    background: '#0f1419',
    border: '1px solid #2a3142',
    borderRadius: '4px',
    color: '#e0e6ed',
    fontSize: '0.9rem',
  },
  colorInput: {
    width: '60px',
    height: '36px',
    border: '1px solid #2a3142',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  btnSmall: {
    padding: '0.25rem 0.75rem',
    background: '#2a3142',
    color: '#e0e6ed',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    gap: '8px',
  },
  btnSave: {
    padding: '0.5rem 1rem',
    background: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnCancel: {
    padding: '0.5rem 1rem',
    background: '#2a3142',
    color: '#e0e6ed',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  sectionTitle: {
    color: '#e0e6ed',
    fontSize: '1.1rem',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #2a3142',
  },
  usersList: {
    marginTop: '1rem',
  },
  userCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  userCard: {
    background: '#1a1f2e',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #2a3142',
  },
  userHeader: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    alignItems: 'center',
  },
  userAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#e0e6ed',
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  userEmail: {
    color: '#8b98a9',
    fontSize: '0.85rem',
    marginBottom: '0.25rem',
  },
  userRole: {
    color: '#00A3FF',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  inactiveBadge: {
    background: '#f44336',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  userStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
    marginBottom: '1rem',
    padding: '0.75rem',
    background: '#0f1419',
    borderRadius: '6px',
  },
  stat: {
    textAlign: 'center',
  },
  statValue: {
    color: '#00A3FF',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#8b98a9',
    fontSize: '0.7rem',
    marginTop: '0.25rem',
  },
  userActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  btnEdit: {
    flex: 1,
    padding: '0.5rem',
    background: '#2a3142',
    color: '#e0e6ed',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  btnActivate: {
    flex: 1,
    padding: '0.5rem',
    background: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  btnDeactivate: {
    flex: 1,
    padding: '0.5rem',
    background: '#ff9800',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  btnDelete: {
    flex: 1,
    padding: '0.5rem',
    background: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#8b98a9',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    opacity: 0.5,
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #2a3142',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  btnClose: {
    padding: '0.5rem 1.5rem',
    background: '#00A3FF',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
