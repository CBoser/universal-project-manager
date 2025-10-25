// ============================================
// Universal Project Manager - Reports History Modal
// ============================================

import { theme } from '../../config/theme';
import Modal from '../Modal';

export interface ProgressSnapshot {
  timestamp: string;
  percentComplete: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  totalEstHours: number;
  totalActualHours: number;
  note?: string;
}

interface ReportsHistoryModalProps {
  show: boolean;
  onClose: () => void;
  snapshots: ProgressSnapshot[];
  onDeleteSnapshot: (timestamp: string) => void;
}

export default function ReportsHistoryModal({
  show,
  onClose,
  snapshots,
  onDeleteSnapshot,
}: ReportsHistoryModalProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortedSnapshots = [...snapshots].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Modal show={show} onClose={onClose} title="📊 Progress Reports History" width="800px">
      {sortedSnapshots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: theme.textMuted }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No saved reports yet</h3>
          <p>Save progress snapshots to track your project over time</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sortedSnapshots.map((snapshot) => (
            <div
              key={snapshot.timestamp}
              style={{
                background: theme.bgSecondary,
                padding: '1.5rem',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
              }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: `1px solid ${theme.border}`,
              }}>
                <div>
                  <h4 style={{ margin: 0, color: theme.textPrimary }}>
                    {formatDate(snapshot.timestamp)}
                  </h4>
                  {snapshot.note && (
                    <p style={{ margin: '0.25rem 0 0 0', color: theme.textSecondary, fontSize: '0.9rem' }}>
                      {snapshot.note}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this snapshot?')) {
                      onDeleteSnapshot(snapshot.timestamp);
                    }
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: theme.accentRed,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}>
                  🗑️ Delete
                </button>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: theme.textMuted }}>Completion</span>
                  <span style={{ color: theme.textPrimary, fontWeight: '600' }}>
                    {snapshot.percentComplete}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: theme.bgTertiary,
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${snapshot.percentComplete}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  }} />
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem',
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  background: theme.bgTertiary,
                  borderRadius: '6px',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: theme.textPrimary }}>
                    {snapshot.totalTasks}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: theme.textMuted }}>Total Tasks</div>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  background: theme.bgTertiary,
                  borderRadius: '6px',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: theme.statusComplete }}>
                    {snapshot.completedTasks}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: theme.textMuted }}>Completed</div>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  background: theme.bgTertiary,
                  borderRadius: '6px',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: theme.statusInProgress }}>
                    {snapshot.inProgressTasks}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: theme.textMuted }}>In Progress</div>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  background: theme.bgTertiary,
                  borderRadius: '6px',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: theme.statusBlocked }}>
                    {snapshot.blockedTasks}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: theme.textMuted }}>Blocked</div>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  background: theme.bgTertiary,
                  borderRadius: '6px',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: theme.textPrimary }}>
                    {snapshot.totalEstHours}h
                  </div>
                  <div style={{ fontSize: '0.85rem', color: theme.textMuted }}>Est. Hours</div>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  background: theme.bgTertiary,
                  borderRadius: '6px',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: theme.accentBlue }}>
                    {snapshot.totalActualHours}h
                  </div>
                  <div style={{ fontSize: '0.85rem', color: theme.textMuted }}>Actual Hours</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Close Button */}
      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{
            padding: '0.75rem 1.5rem',
            background: theme.accentBlue,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}>
          Close
        </button>
      </div>
    </Modal>
  );
}
