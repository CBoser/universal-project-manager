/**
 * Sync Status Indicator Component
 * Shows sync status with visual feedback
 */

import React from 'react';
import { theme } from '../config/theme';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface SyncIndicatorProps {
  status: SyncStatus;
  lastSyncTime?: string;
  error?: string;
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  status,
  lastSyncTime,
  error,
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: '🔄',
          text: 'Syncing...',
          color: theme.accentBlue,
        };
      case 'synced':
        return {
          icon: '✓',
          text: lastSyncTime ? `Synced ${formatTime(lastSyncTime)}` : 'Synced',
          color: theme.accentGreen,
        };
      case 'error':
        return {
          icon: '⚠️',
          text: error || 'Sync failed',
          color: theme.accentRed,
        };
      default:
        return {
          icon: '○',
          text: 'Not synced',
          color: theme.textMuted,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '4px 12px',
        borderRadius: '12px',
        background: `${statusInfo.color}22`,
        fontSize: '0.85rem',
        color: statusInfo.color,
        fontWeight: '500',
      }}
      title={error || statusInfo.text}
    >
      <span
        style={{
          display: 'inline-block',
          animation: status === 'syncing' ? 'spin 1s linear infinite' : 'none',
        }}
      >
        {statusInfo.icon}
      </span>
      <span>{statusInfo.text}</span>
    </div>
  );
};

// Helper to format time ago
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;

  return date.toLocaleDateString();
}
