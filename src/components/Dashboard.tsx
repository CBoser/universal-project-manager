// ============================================
// Universal Project Manager - Dashboard Component
// ============================================

import React, { useState, useEffect } from 'react';
import { SavedProject, ProjectStatus } from '../types';
import {
  getAllProjects,
  getProjectsByStatus,
  getArchivedProjects,
  calculateProjectStats,
  deleteProject,
  archiveProject,
  exportProjectToJSON,
  setCurrentProjectId,
} from '../services/projectStorage';

interface DashboardProps {
  onOpenProject: (projectId: string) => void;
  onNewProject: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onOpenProject, onNewProject }) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Load projects
  useEffect(() => {
    loadProjects();
  }, [filter, showArchived]);

  const loadProjects = () => {
    if (showArchived) {
      setProjects(getArchivedProjects());
    } else {
      setProjects(getProjectsByStatus(filter));
    }
  };

  // Get filter counts
  const getFilterCounts = () => {
    const allProjects = getAllProjects().filter(p => !p.meta.archived);
    return {
      all: allProjects.length,
      active: allProjects.filter(p => p.meta.status === 'active').length,
      backlog: allProjects.filter(p => p.meta.status === 'backlog').length,
      complete: allProjects.filter(p => p.meta.status === 'complete').length,
      'on-hold': allProjects.filter(p => p.meta.status === 'on-hold').length,
    };
  };

  const counts = getFilterCounts();

  const handleOpenProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    onOpenProject(projectId);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      deleteProject(projectId);
      loadProjects();
    }
  };

  const handleArchiveProject = (projectId: string) => {
    const project = projects.find(p => p.meta.id === projectId);
    const isArchived = project?.meta.archived;
    archiveProject(projectId, !isArchived);
    loadProjects();
  };

  const handleExportProject = (projectId: string) => {
    try {
      const json = exportProjectToJSON(projectId);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const project = projects.find(p => p.meta.id === projectId);
      a.href = url;
      a.download = `${project?.meta.name || 'project'}_export.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting project:', error);
      alert('Failed to export project');
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const badges = {
      active: { icon: '🟢', label: 'Active', className: 'active' },
      backlog: { icon: '🔵', label: 'Backlog', className: 'backlog' },
      complete: { icon: '✅', label: 'Complete', className: 'complete' },
      'on-hold': { icon: '🟡', label: 'On Hold', className: 'on-hold' },
    };
    return badges[status] || badges.active;
  };

  const getProjectTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      software_development: 'Software Development',
      marketing_campaign: 'Marketing Campaign',
      course_creation: 'Course Creation',
      event_planning: 'Event Planning',
      product_launch: 'Product Launch',
      research_project: 'Research Project',
      content_creation: 'Content Creation',
      construction: 'Construction',
      business_operations: 'Business Operations',
      creative_project: 'Creative Project',
      custom: 'Custom',
    };
    return labels[type] || type;
  };

  return (
    <div style={styles.dashboard}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Universal Project Manager</h1>
        <button style={styles.btnNew} onClick={onNewProject}>
          <span>+</span>
          <span>New Project</span>
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterButtons}>
          <button
            style={{
              ...styles.filterBtn,
              ...(filter === 'all' ? styles.filterBtnActive : {}),
            }}
            onClick={() => setFilter('all')}>
            All {counts.all > 0 && <span style={styles.count}>{counts.all}</span>}
          </button>
          <button
            style={{
              ...styles.filterBtn,
              ...(filter === 'active' ? styles.filterBtnActive : {}),
            }}
            onClick={() => setFilter('active')}>
            Active {counts.active > 0 && <span style={styles.count}>{counts.active}</span>}
          </button>
          <button
            style={{
              ...styles.filterBtn,
              ...(filter === 'backlog' ? styles.filterBtnActive : {}),
            }}
            onClick={() => setFilter('backlog')}>
            Backlog {counts.backlog > 0 && <span style={styles.count}>{counts.backlog}</span>}
          </button>
          <button
            style={{
              ...styles.filterBtn,
              ...(filter === 'complete' ? styles.filterBtnActive : {}),
            }}
            onClick={() => setFilter('complete')}>
            Complete {counts.complete > 0 && <span style={styles.count}>{counts.complete}</span>}
          </button>
          <button
            style={{
              ...styles.filterBtn,
              ...(filter === 'on-hold' ? styles.filterBtnActive : {}),
            }}
            onClick={() => setFilter('on-hold')}>
            On Hold {counts['on-hold'] > 0 && <span style={styles.count}>{counts['on-hold']}</span>}
          </button>
        </div>
        <label style={styles.archivedToggle}>
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            style={styles.checkbox}
          />
          <span>Show Archived</span>
        </label>
      </div>

      {/* Projects Grid */}
      <div style={styles.projectsGrid}>
        {projects.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>📋</div>
            <h3>No Projects Found</h3>
            <p>{showArchived ? 'No archived projects yet' : 'Get started by creating your first project'}</p>
            {!showArchived && (
              <button style={styles.btnNew} onClick={onNewProject}>
                Create Project
              </button>
            )}
          </div>
        ) : (
          projects.map((project) => {
            const stats = calculateProjectStats(project);
            const badge = getStatusBadge(project.meta.status);

            return (
              <div
                key={project.meta.id}
                style={styles.projectCard}
                onClick={() => handleOpenProject(project.meta.id)}>
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <div style={styles.projectIcon}>{project.meta.icon || '📁'}</div>
                  <div style={styles.cardTitle}>
                    <h3>{project.meta.name}</h3>
                    <div style={styles.projectType}>{getProjectTypeLabel(project.meta.projectType)}</div>
                  </div>
                  <div style={styles.cardMenu}>
                    <button
                      style={styles.menuBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === project.meta.id ? null : project.meta.id);
                      }}>
                      ⋮
                    </button>
                    {menuOpen === project.meta.id && (
                      <div style={styles.menuDropdown}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveProject(project.meta.id);
                            setMenuOpen(null);
                          }}>
                          {project.meta.archived ? '📤 Unarchive' : '📦 Archive'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportProject(project.meta.id);
                            setMenuOpen(null);
                          }}>
                          💾 Export
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.meta.id);
                            setMenuOpen(null);
                          }}
                          style={{ color: '#ef4444' }}>
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div style={styles.progressSection}>
                  <div style={styles.progressBarContainer}>
                    <div style={{ ...styles.progressBar, width: `${stats.progress}%` }} />
                  </div>
                  <div style={styles.progressText}>Progress: {stats.progress}%</div>
                </div>

                {/* Stats */}
                <div style={styles.cardStats}>
                  {stats.totalActualHours} / {stats.totalEstHours} hours
                </div>

                {/* Status Badge */}
                <div style={{ ...styles.statusBadge, ...styles[`status_${badge.className}` as keyof typeof styles] }}>
                  {badge.icon} {badge.label}
                </div>

                {/* Actions */}
                <div style={styles.cardActions}>
                  <button
                    style={styles.btnOpen}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenProject(project.meta.id);
                    }}>
                    Open Project
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  dashboard: {
    background: '#141b24',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    border: '1px solid #2a3441',
    minHeight: '100vh',
  },
  header: {
    background: '#1a2332',
    color: '#e6eef8',
    padding: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
    borderBottom: '1px solid #2a3441',
  },
  title: {
    fontSize: '28px',
    fontWeight: 600,
    margin: 0,
  },
  btnNew: {
    background: '#00A3FF',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
  },
  filters: {
    padding: '20px 30px',
    background: '#1a2332',
    borderBottom: '1px solid #2a3441',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  filterButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '8px 16px',
    border: '2px solid #2a3441',
    background: '#141b24',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    color: '#e6eef8',
  },
  filterBtnActive: {
    background: '#00A3FF',
    borderColor: '#00A3FF',
  },
  count: {
    background: 'rgba(255,255,255,0.15)',
    padding: '2px 8px',
    borderRadius: '10px',
    marginLeft: '6px',
    fontSize: '12px',
  },
  archivedToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#8b98a9',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  projectsGrid: {
    padding: '30px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    background: '#0b0f14',
  },
  projectCard: {
    background: '#1a2332',
    border: '2px solid #2a3441',
    borderRadius: '12px',
    padding: '20px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '15px',
  },
  projectIcon: {
    fontSize: '32px',
    lineHeight: 1,
  },
  cardTitle: {
    flex: 1,
  },
  projectType: {
    fontSize: '13px',
    color: '#8b98a9',
  },
  cardMenu: {
    position: 'relative',
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
    color: '#8b98a9',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
  menuDropdown: {
    position: 'absolute',
    right: 0,
    top: '100%',
    background: '#1a2332',
    border: '1px solid #2a3441',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 10,
    minWidth: '150px',
    display: 'flex',
    flexDirection: 'column',
  },
  progressSection: {
    marginBottom: '15px',
  },
  progressBarContainer: {
    background: '#2a3441',
    height: '8px',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #00A3FF 0%, #0090e0 100%)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '14px',
    color: '#8b98a9',
    fontWeight: 500,
  },
  cardStats: {
    fontSize: '14px',
    color: '#8b98a9',
    marginBottom: '15px',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '15px',
  },
  status_active: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  status_backlog: {
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    border: '1px solid rgba(59, 130, 246, 0.3)',
  },
  status_complete: {
    background: 'rgba(107, 114, 128, 0.15)',
    color: '#9ca3af',
    border: '1px solid rgba(107, 114, 128, 0.3)',
  },
  'status_on-hold': {
    background: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
  },
  btnOpen: {
    flex: 1,
    padding: '10px',
    background: '#00A3FF',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 30px',
    color: '#8b98a9',
    gridColumn: '1 / -1',
  },
  emptyStateIcon: {
    fontSize: '64px',
    marginBottom: '20px',
    opacity: 0.5,
  },
};

// Add hover styles via CSS-in-JS isn't perfect, so we'll add a style tag
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  .project-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 163, 255, 0.2);
    border-color: #00A3FF !important;
  }
  .menu-dropdown button {
    background: none;
    border: none;
    padding: 10px 15px;
    text-align: left;
    cursor: pointer;
    color: #e6eef8;
    font-size: 14px;
    width: 100%;
    transition: background 0.2s;
  }
  .menu-dropdown button:hover {
    background: #2a3441;
  }
`;
document.head.appendChild(styleTag);

export default Dashboard;
