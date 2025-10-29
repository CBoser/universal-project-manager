import React, { useState, useEffect } from 'react';
import {
  getFilteredTimeLogs,
  calculateTimeLogStats,
  exportTimeLogsToCSV,
  exportTimeLogsToJSON,
  TimeLogEntry,
  TimeLogFilter,
} from '../../services/timeLogService';
import { getAllProjects } from '../../services/projectStorage';
import { getAllUsers } from '../../services/userService';
import { SavedProject } from '../../types';
import { User } from '../../services/userService';

interface TimeLogViewerModalProps {
  show: boolean;
  onClose: () => void;
}

export const TimeLogViewerModal: React.FC<TimeLogViewerModalProps> = ({
  show,
  onClose,
}) => {
  const [logs, setLogs] = useState<TimeLogEntry[]>([]);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Filter state
  // const [filter, setFilter] = useState<TimeLogFilter>({});
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (show) {
      loadData();
    }
  }, [show]);

  useEffect(() => {
    applyFilters();
  }, [selectedProjects, selectedUsers, startDate, endDate, searchQuery]);

  const loadData = () => {
    setProjects(getAllProjects());
    setUsers(getAllUsers());
    applyFilters();
  };

  const applyFilters = () => {
    const filter: TimeLogFilter = {};

    if (selectedProjects.length > 0) {
      filter.projectIds = selectedProjects;
    }

    if (selectedUsers.length > 0) {
      filter.userIds = selectedUsers;
    }

    if (startDate) {
      filter.startDate = startDate;
    }

    if (endDate) {
      filter.endDate = endDate;
    }

    if (searchQuery.trim()) {
      filter.searchQuery = searchQuery.trim();
    }

    const filtered = getFilteredTimeLogs(filter);
    setLogs(filtered);
  };

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllProjects = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map(p => p.meta.id));
    }
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleClearFilters = () => {
    setSelectedProjects([]);
    setSelectedUsers([]);
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const handleExportCSV = () => {
    const csv = exportTimeLogsToCSV(logs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = exportTimeLogsToJSON(logs);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time_logs_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSetThisWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    setStartDate(monday.toISOString().split('T')[0]);
    setEndDate(sunday.toISOString().split('T')[0]);
  };

  const handleSetThisMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  };

  const stats = calculateTimeLogStats(logs);

  if (!show) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>📋 Time Log Viewer</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.content}>
          {/* Summary Stats */}
          <div style={styles.statsSection}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalHours.toFixed(1)}h</div>
              <div style={styles.statLabel}>Total Hours</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalEntries}</div>
              <div style={styles.statLabel}>Time Entries</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{Object.keys(stats.byProject).length}</div>
              <div style={styles.statLabel}>Projects</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{Object.keys(stats.byUser).length}</div>
              <div style={styles.statLabel}>Team Members</div>
            </div>
          </div>

          {/* Filters */}
          <div style={styles.filterSection}>
            <h3 style={styles.sectionTitle}>Filters</h3>

            <div style={styles.filterGrid}>
              {/* Date Range */}
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Date Range</label>
                <div style={styles.dateInputs}>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={styles.dateInput}
                  />
                  <span style={{ color: '#8b98a9' }}>to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={styles.dateInput}
                  />
                </div>
                <div style={styles.datePresets}>
                  <button onClick={handleSetThisWeek} style={styles.presetBtn}>
                    This Week
                  </button>
                  <button onClick={handleSetThisMonth} style={styles.presetBtn}>
                    This Month
                  </button>
                </div>
              </div>

              {/* Search */}
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks, subtasks, notes..."
                  style={styles.searchInput}
                />
              </div>

              {/* Projects Filter */}
              <div style={styles.filterGroup}>
                <div style={styles.filterHeader}>
                  <label style={styles.filterLabel}>Projects ({selectedProjects.length}/{projects.length})</label>
                  <button onClick={handleSelectAllProjects} style={styles.selectAllBtn}>
                    {selectedProjects.length === projects.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div style={styles.checkboxList}>
                  {projects.map(project => (
                    <label key={project.meta.id} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.meta.id)}
                        onChange={() => handleProjectToggle(project.meta.id)}
                        style={styles.checkbox}
                      />
                      <span>{project.meta.icon} {project.meta.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Users Filter */}
              <div style={styles.filterGroup}>
                <div style={styles.filterHeader}>
                  <label style={styles.filterLabel}>Team Members ({selectedUsers.length}/{users.length})</label>
                  <button onClick={handleSelectAllUsers} style={styles.selectAllBtn}>
                    {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div style={styles.checkboxList}>
                  {users.map(user => (
                    <label key={user.id} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserToggle(user.id)}
                        style={styles.checkbox}
                      />
                      <div
                        style={{
                          ...styles.userInitials,
                          backgroundColor: user.color,
                        }}
                      >
                        {user.initials}
                      </div>
                      <span>{user.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={styles.filterActions}>
              <button onClick={handleClearFilters} style={styles.clearBtn}>
                Clear All Filters
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleExportCSV} style={styles.exportBtn}>
                  📄 Export CSV
                </button>
                <button onClick={handleExportJSON} style={styles.exportBtn}>
                  📋 Export JSON
                </button>
              </div>
            </div>
          </div>

          {/* Time Logs Table */}
          <div style={styles.tableSection}>
            <h3 style={styles.sectionTitle}>
              Time Logs ({logs.length} {logs.length === 1 ? 'entry' : 'entries'})
            </h3>
            {logs.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>⏱️</div>
                <p>No time logs found matching your filters.</p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={{ ...styles.th, width: '100px' }}>Date</th>
                      <th style={{ ...styles.th, flex: 2 }}>Project</th>
                      <th style={{ ...styles.th, flex: 2 }}>Task</th>
                      <th style={{ ...styles.th, flex: 1.5 }}>Subtask</th>
                      <th style={{ ...styles.th, flex: 1.5 }}>User</th>
                      <th style={{ ...styles.th, width: '80px', textAlign: 'right' }}>Hours</th>
                      <th style={{ ...styles.th, flex: 2 }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} style={styles.tableRow}>
                        <td style={styles.td}>
                          {new Date(log.date).toLocaleDateString()}
                        </td>
                        <td style={{ ...styles.td, flex: 2 }}>
                          {log.projectName}
                        </td>
                        <td style={{ ...styles.td, flex: 2 }}>
                          {log.taskName}
                        </td>
                        <td style={{ ...styles.td, flex: 1.5, color: log.subtaskName ? '#e0e6ed' : '#666' }}>
                          {log.subtaskName || '—'}
                        </td>
                        <td style={{ ...styles.td, flex: 1.5 }}>
                          {log.userName}
                        </td>
                        <td style={{ ...styles.td, width: '80px', textAlign: 'right', fontWeight: 'bold', color: '#00A3FF' }}>
                          {log.hours.toFixed(2)}h
                        </td>
                        <td style={{ ...styles.td, flex: 2, fontSize: '0.85rem', color: '#8b98a9' }}>
                          {log.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
    width: '95%',
    maxWidth: '1400px',
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
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    background: '#1a1f2e',
    padding: '1rem',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #2a3142',
  },
  statValue: {
    color: '#00A3FF',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  },
  statLabel: {
    color: '#8b98a9',
    fontSize: '0.85rem',
  },
  filterSection: {
    background: '#1a1f2e',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    border: '1px solid #2a3142',
  },
  sectionTitle: {
    color: '#e0e6ed',
    fontSize: '1.1rem',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #2a3142',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  filterLabel: {
    color: '#b0b8c5',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectAllBtn: {
    padding: '0.25rem 0.5rem',
    background: '#2a3142',
    color: '#00A3FF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  dateInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  dateInput: {
    flex: 1,
    padding: '0.5rem',
    background: '#0f1419',
    border: '1px solid #2a3142',
    borderRadius: '4px',
    color: '#e0e6ed',
    fontSize: '0.85rem',
  },
  datePresets: {
    display: 'flex',
    gap: '0.5rem',
  },
  presetBtn: {
    flex: 1,
    padding: '0.35rem 0.5rem',
    background: '#2a3142',
    color: '#e0e6ed',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  searchInput: {
    padding: '0.5rem',
    background: '#0f1419',
    border: '1px solid #2a3142',
    borderRadius: '4px',
    color: '#e0e6ed',
    fontSize: '0.85rem',
  },
  checkboxList: {
    maxHeight: '200px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '0.5rem',
    background: '#0f1419',
    borderRadius: '4px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#e0e6ed',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  userInitials: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 'bold',
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '1rem',
    borderTop: '1px solid #2a3142',
  },
  clearBtn: {
    padding: '0.5rem 1rem',
    background: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  exportBtn: {
    padding: '0.5rem 1rem',
    background: '#2a3142',
    color: '#e0e6ed',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  tableSection: {
    background: '#1a1f2e',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid #2a3142',
  },
  tableContainer: {
    overflowX: 'auto',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    display: 'table',
  },
  tableHeader: {
    position: 'sticky',
    top: 0,
    background: '#0f1419',
    zIndex: 1,
    display: 'table-row',
  },
  th: {
    padding: '0.75rem',
    textAlign: 'left',
    color: '#8b98a9',
    fontSize: '0.85rem',
    fontWeight: '600',
    borderBottom: '2px solid #2a3142',
  },
  tableRow: {
    borderBottom: '1px solid #2a3142',
    display: 'table-row',
  },
  td: {
    padding: '0.75rem',
    color: '#e0e6ed',
    fontSize: '0.9rem',
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
