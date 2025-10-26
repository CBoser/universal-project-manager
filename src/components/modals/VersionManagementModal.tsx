// ============================================
// Universal Project Manager - Version Management Modal
// ============================================

import React, { useState, useEffect } from 'react';
import type { Task, TaskState, ProjectMeta } from '../../types';

interface ProjectVersion {
  id: string;
  name: string;
  timestamp: string;
  tasks: Task[];
  taskStates: { [key: string]: TaskState };
  projectMeta: ProjectMeta;
}

interface VersionManagementModalProps {
  show: boolean;
  onClose: () => void;
  currentData: {
    tasks: Task[];
    taskStates: { [key: string]: TaskState };
    projectMeta: ProjectMeta;
  };
  onRestore: (version: ProjectVersion) => void;
}

const VersionManagementModal: React.FC<VersionManagementModalProps> = ({
  show,
  onClose,
  currentData,
  onRestore,
}) => {
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [versionName, setVersionName] = useState('');
  const [showConfirmRestore, setShowConfirmRestore] = useState<string | null>(null);

  // Load saved versions from localStorage
  useEffect(() => {
    if (show) {
      loadVersions();
    }
  }, [show]);

  const loadVersions = () => {
    const saved = localStorage.getItem('project_versions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setVersions(parsed);
      } catch (e) {
        console.error('Failed to load versions:', e);
      }
    }
  };

  const saveVersions = (updatedVersions: ProjectVersion[]) => {
    localStorage.setItem('project_versions', JSON.stringify(updatedVersions));
    setVersions(updatedVersions);
  };

  const handleSaveVersion = () => {
    if (!versionName.trim()) {
      alert('Please enter a name for this version');
      return;
    }

    const newVersion: ProjectVersion = {
      id: `version_${Date.now()}`,
      name: versionName.trim(),
      timestamp: new Date().toISOString(),
      tasks: currentData.tasks,
      taskStates: currentData.taskStates,
      projectMeta: currentData.projectMeta,
    };

    const updatedVersions = [newVersion, ...versions];
    saveVersions(updatedVersions);
    setVersionName('');
    alert(`Version "${newVersion.name}" saved successfully!`);
  };

  const handleRestoreVersion = (version: ProjectVersion) => {
    setShowConfirmRestore(null);
    onRestore(version);
    onClose();
    alert(`Restored version "${version.name}"`);
  };

  const handleDeleteVersion = (versionId: string) => {
    if (!confirm('Are you sure you want to delete this version?')) {
      return;
    }

    const updatedVersions = versions.filter(v => v.id !== versionId);
    saveVersions(updatedVersions);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>
            Version Management
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
            }}>
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          flex: 1,
        }}>
          {/* Save New Version */}
          <div style={{
            background: '#f5f5f5',
            padding: '1.25rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#333' }}>
              Save Current Version
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="Version name (e.g., 'Sprint 1 Planning', 'Before major refactor')"
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveVersion();
                  }
                }}
              />
              <button
                onClick={handleSaveVersion}
                style={{
                  padding: '0.65rem 1.25rem',
                  background: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                }}>
                Save Version
              </button>
            </div>
          </div>

          {/* Saved Versions List */}
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#333' }}>
            Saved Versions ({versions.length})
          </h3>

          {versions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#999',
              fontStyle: 'italic',
            }}>
              No saved versions yet. Save your first version above!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {versions.map((version) => (
                <div
                  key={version.id}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    padding: '1rem',
                    background: '#fafafa',
                  }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                  }}>
                    <div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '0.25rem',
                      }}>
                        {version.name}
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#666',
                      }}>
                        {formatDate(version.timestamp)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setShowConfirmRestore(version.id)}
                        style={{
                          padding: '0.4rem 0.9rem',
                          background: '#2196F3',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}>
                        Restore
                      </button>
                      <button
                        onClick={() => handleDeleteVersion(version.id)}
                        style={{
                          padding: '0.4rem 0.9rem',
                          background: '#f44336',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}>
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Version Stats */}
                  <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    fontSize: '0.85rem',
                    color: '#666',
                  }}>
                    <span>{version.tasks.length} tasks</span>
                    {version.projectMeta.collaborators && (
                      <span>{version.projectMeta.collaborators.length} collaborators</span>
                    )}
                    {version.projectMeta.name && (
                      <span>Project: {version.projectMeta.name}</span>
                    )}
                  </div>

                  {/* Confirmation Dialog */}
                  {showConfirmRestore === version.id && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      background: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '4px',
                    }}>
                      <div style={{
                        fontSize: '0.9rem',
                        marginBottom: '0.75rem',
                        color: '#856404',
                      }}>
                        ⚠️ Are you sure? This will replace your current project data with this version.
                        <br />
                        <strong>Consider saving your current work first!</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleRestoreVersion(version)}
                          style={{
                            padding: '0.4rem 0.9rem',
                            background: '#f44336',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                          }}>
                          Yes, Restore
                        </button>
                        <button
                          onClick={() => setShowConfirmRestore(null)}
                          style={{
                            padding: '0.4rem 0.9rem',
                            background: '#6c757d',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.65rem 1.5rem',
              background: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionManagementModal;
