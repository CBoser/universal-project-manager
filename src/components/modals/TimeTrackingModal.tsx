import React from 'react';
import { Task, TaskState } from '../../types';

interface TimeTrackingModalProps {
  show: boolean;
  onClose: () => void;
  tasks: Task[];
  taskStates: { [key: string]: TaskState };
  phases: { [key: string]: string };
  phaseColors: { [key: string]: string };
}

export const TimeTrackingModal: React.FC<TimeTrackingModalProps> = ({
  show,
  onClose,
  tasks,
  taskStates,
  phases,
  phaseColors,
}) => {
  if (!show) return null;

  // Calculate overall time statistics
  const calculateTotalHours = () => {
    let totalEst = 0;
    let totalActual = 0;

    tasks.forEach(task => {
      if (task.subtasks && task.subtasks.length > 0) {
        // Aggregate from subtasks
        task.subtasks.forEach(st => {
          totalEst += st.estHours || 0;
          totalActual += st.actualHours || 0;
        });
      } else {
        // Use task-level estimates
        const state = taskStates[task.id];
        totalEst += state?.estHours || task.adjustedEstHours || 0;
        const actualHours = parseFloat(state?.actualHours || '0');
        totalActual += actualHours;
      }
    });

    return { totalEst, totalActual };
  };

  // Calculate time by phase
  const calculatePhaseHours = () => {
    const phaseHours: { [key: string]: { est: number; actual: number } } = {};

    tasks.forEach(task => {
      if (!phaseHours[task.phase]) {
        phaseHours[task.phase] = { est: 0, actual: 0 };
      }

      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(st => {
          phaseHours[task.phase].est += st.estHours || 0;
          phaseHours[task.phase].actual += st.actualHours || 0;
        });
      } else {
        const state = taskStates[task.id];
        phaseHours[task.phase].est += state?.estHours || task.adjustedEstHours || 0;
        const actualHours = parseFloat(state?.actualHours || '0');
        phaseHours[task.phase].actual += actualHours;
      }
    });

    return phaseHours;
  };

  // Calculate time by task (with subtask breakdown)
  const calculateTaskHours = () => {
    return tasks.map(task => {
      let est = 0;
      let actual = 0;

      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(st => {
          est += st.estHours || 0;
          actual += st.actualHours || 0;
        });
      } else {
        const state = taskStates[task.id];
        est = state?.estHours || task.adjustedEstHours || 0;
        actual = parseFloat(state?.actualHours || '0');
      }

      return {
        task,
        est,
        actual,
        variance: actual - est,
        percentComplete: est > 0 ? (actual / est) * 100 : 0,
      };
    });
  };

  const { totalEst, totalActual } = calculateTotalHours();
  const phaseHours = calculatePhaseHours();
  const taskHours = calculateTaskHours();

  const overallVariance = totalActual - totalEst;
  const overallPercent = totalEst > 0 ? (totalActual / totalEst) * 100 : 0;

  const getPhaseColor = (phaseId: string) => {
    return phaseColors[phaseId] || '#00A3FF';
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>⏱️ Time Tracking Analytics</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.content}>
          {/* Overall Summary */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>📊 Overall Project Summary</h3>
            <div style={styles.summaryGrid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Estimated Hours</div>
                <div style={styles.statValue}>{totalEst.toFixed(1)}h</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Actual Hours</div>
                <div style={{ ...styles.statValue, color: totalActual > totalEst ? '#f44336' : '#4caf50' }}>
                  {totalActual.toFixed(1)}h
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Variance</div>
                <div style={{ ...styles.statValue, color: overallVariance > 0 ? '#f44336' : '#4caf50' }}>
                  {overallVariance >= 0 ? '+' : ''}{overallVariance.toFixed(1)}h
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>% of Estimate</div>
                <div style={{ ...styles.statValue, color: overallPercent > 100 ? '#f44336' : '#4caf50' }}>
                  {overallPercent.toFixed(0)}%
                </div>
              </div>
            </div>
          </section>

          {/* Phase Breakdown */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>📈 Time by Phase</h3>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <div style={{ ...styles.tableCell, flex: 2 }}>Phase</div>
                <div style={styles.tableCell}>Estimated</div>
                <div style={styles.tableCell}>Actual</div>
                <div style={styles.tableCell}>Variance</div>
                <div style={styles.tableCell}>% Complete</div>
              </div>
              {Object.entries(phaseHours).map(([phaseId, hours]) => {
                const variance = hours.actual - hours.est;
                const percent = hours.est > 0 ? (hours.actual / hours.est) * 100 : 0;
                return (
                  <div key={phaseId} style={styles.tableRow}>
                    <div style={{ ...styles.tableCell, flex: 2 }}>
                      <span style={{
                        ...styles.phaseBadge,
                        backgroundColor: `${getPhaseColor(phaseId)}22`,
                        color: getPhaseColor(phaseId)
                      }}>
                        {phases[phaseId]}
                      </span>
                    </div>
                    <div style={styles.tableCell}>{hours.est.toFixed(1)}h</div>
                    <div style={{
                      ...styles.tableCell,
                      color: hours.actual > hours.est ? '#f44336' : '#e0e6ed'
                    }}>
                      {hours.actual.toFixed(1)}h
                    </div>
                    <div style={{
                      ...styles.tableCell,
                      color: variance > 0 ? '#f44336' : '#4caf50'
                    }}>
                      {variance >= 0 ? '+' : ''}{variance.toFixed(1)}h
                    </div>
                    <div style={{
                      ...styles.tableCell,
                      color: percent > 100 ? '#f44336' : '#4caf50'
                    }}>
                      {percent.toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Task Breakdown */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>📝 Time by Task</h3>
            <div style={{ ...styles.table, maxHeight: '400px', overflowY: 'auto' }}>
              <div style={{ ...styles.tableHeader, position: 'sticky', top: 0, backgroundColor: '#1a1f2e', zIndex: 1 }}>
                <div style={{ ...styles.tableCell, flex: 3 }}>Task</div>
                <div style={styles.tableCell}>Estimated</div>
                <div style={styles.tableCell}>Actual</div>
                <div style={styles.tableCell}>Variance</div>
                <div style={styles.tableCell}>% Complete</div>
              </div>
              {taskHours
                .filter(th => th.est > 0 || th.actual > 0) // Only show tasks with hours
                .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance)) // Sort by variance magnitude
                .map((th) => (
                  <div key={th.task.id} style={styles.tableRow}>
                    <div style={{ ...styles.tableCell, flex: 3, fontSize: '12px' }}>
                      {th.task.task}
                      {th.task.subtasks && th.task.subtasks.length > 0 && (
                        <span style={{ color: '#666', marginLeft: '8px' }}>
                          ({th.task.subtasks.length} subtasks)
                        </span>
                      )}
                    </div>
                    <div style={styles.tableCell}>{th.est.toFixed(1)}h</div>
                    <div style={{
                      ...styles.tableCell,
                      color: th.actual > th.est ? '#f44336' : '#e0e6ed'
                    }}>
                      {th.actual.toFixed(1)}h
                    </div>
                    <div style={{
                      ...styles.tableCell,
                      color: th.variance > 0 ? '#f44336' : '#4caf50',
                      fontWeight: Math.abs(th.variance) > th.est * 0.2 ? 'bold' : 'normal'
                    }}>
                      {th.variance >= 0 ? '+' : ''}{th.variance.toFixed(1)}h
                    </div>
                    <div style={{
                      ...styles.tableCell,
                      color: th.percentComplete > 100 ? '#f44336' : '#4caf50'
                    }}>
                      {th.percentComplete.toFixed(0)}%
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Budget Analysis */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>💰 Budget Analysis</h3>
            <div style={styles.analysisCard}>
              <p style={styles.analysisText}>
                {overallVariance > 0 ? (
                  <>
                    <span style={{ color: '#f44336', fontWeight: 'bold' }}>⚠️ Over Budget:</span>
                    {' '}You've spent <strong>{overallVariance.toFixed(1)} hours more</strong> than estimated.
                    This represents a <strong>{((overallVariance / totalEst) * 100).toFixed(1)}%</strong> overrun.
                  </>
                ) : overallVariance < 0 ? (
                  <>
                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>✅ Under Budget:</span>
                    {' '}You've saved <strong>{Math.abs(overallVariance).toFixed(1)} hours</strong> from the estimate.
                    This represents a <strong>{((Math.abs(overallVariance) / totalEst) * 100).toFixed(1)}%</strong> efficiency gain.
                  </>
                ) : (
                  <>
                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>🎯 On Target:</span>
                    {' '}You're exactly on budget! Actual hours match the estimate.
                  </>
                )}
              </p>
              {taskHours.some(th => Math.abs(th.variance) > th.est * 0.3) && (
                <div style={{ ...styles.analysisText, marginTop: '16px' }}>
                  <strong style={{ color: '#ff9800' }}>⚠️ High Variance Tasks:</strong>
                  <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                    {taskHours
                      .filter(th => Math.abs(th.variance) > th.est * 0.3 && th.est > 0)
                      .slice(0, 5)
                      .map(th => (
                        <li key={th.task.id} style={{ marginBottom: '4px' }}>
                          <strong>{th.task.task}</strong>: {th.variance >= 0 ? '+' : ''}{th.variance.toFixed(1)}h variance
                          ({((th.variance / th.est) * 100).toFixed(0)}%)
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.closeButtonBottom}>Close</button>
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
    maxWidth: '1200px',
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
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    color: '#e0e6ed',
    fontSize: '1.1rem',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #2a3142',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    background: '#1a1f2e',
    padding: '1rem',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #2a3142',
  },
  statLabel: {
    color: '#b0b8c5',
    fontSize: '0.85rem',
    marginBottom: '0.5rem',
  },
  statValue: {
    color: '#e0e6ed',
    fontSize: '1.8rem',
    fontWeight: 'bold',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  tableHeader: {
    display: 'flex',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#1a1f2e',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    color: '#b0b8c5',
  },
  tableRow: {
    display: 'flex',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#0b0f14',
    borderRadius: '4px',
    fontSize: '0.9rem',
    color: '#e0e6ed',
  },
  tableCell: {
    flex: 1,
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  phaseBadge: {
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'inline-block',
  },
  analysisCard: {
    background: '#1a1f2e',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid #2a3142',
  },
  analysisText: {
    color: '#e0e6ed',
    fontSize: '0.95rem',
    lineHeight: '1.6',
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #2a3142',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  closeButtonBottom: {
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
