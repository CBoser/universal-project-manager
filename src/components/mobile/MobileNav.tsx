/**
 * MobileNav Component
 * Bottom navigation bar optimized for mobile devices
 *
 * Features:
 * - Fixed bottom positioning with safe area insets
 * - Touch-friendly buttons
 * - Slide-up action sheet for additional options
 * - iOS-style design with blur backdrop
 */

import React, { useState } from 'react';
import { theme } from '../../config/theme';
import { TouchButton } from './TouchButton';

export interface MobileNavProps {
  onAddTask: () => void;
  onOpenMenu: () => void;
  onSave: () => void;
  onFilter?: () => void;
  isSaving?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  onAddTask,
  onOpenMenu,
  onSave,
  onFilter,
  isSaving = false,
  showBackButton = false,
  onBack,
}) => {
  const [showActionSheet, setShowActionSheet] = useState(false);

  const navStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: `${theme.bgSecondary}f0`,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderTop: `1px solid ${theme.border}`,
    paddingBottom: theme.safeArea.bottom,
    paddingLeft: theme.safeArea.left,
    paddingRight: theme.safeArea.right,
    zIndex: theme.zIndex.sticky,
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
  };

  const navContainerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 16px',
    maxWidth: '640px',
    margin: '0 auto',
  };

  const navButtonStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    minWidth: theme.touchTarget.minWidth,
    minHeight: theme.touchTarget.minHeight,
    padding: '8px',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    color: theme.textSecondary,
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: `all ${theme.transition.fast} ease`,
    WebkitTapHighlightColor: 'transparent',
  };

  const navIconStyles: React.CSSProperties = {
    fontSize: '1.5rem',
  };

  const actionSheetOverlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: theme.zIndex.modal,
    animation: showActionSheet ? 'fadeIn 0.3s ease' : 'fadeOut 0.3s ease',
  };

  const actionSheetStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: theme.bgSecondary,
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    padding: '20px',
    paddingBottom: `calc(20px + ${theme.safeArea.bottom})`,
    zIndex: theme.zIndex.modal + 1,
    animation: showActionSheet ? 'slideUp 0.3s ease' : 'slideDown 0.3s ease',
    maxHeight: '70vh',
    overflowY: 'auto',
  };

  const handleButtonClick = (callback: () => void) => {
    callback();
    if (showActionSheet) {
      setShowActionSheet(false);
    }
  };

  return (
    <>
      <nav style={navStyles}>
        <div style={navContainerStyles}>
          {showBackButton ? (
            <button
              onClick={onBack}
              style={{
                ...navButtonStyles,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.hover;
                e.currentTarget.style.color = theme.textPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = theme.textSecondary;
              }}
            >
              <span style={navIconStyles}>←</span>
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={() => setShowActionSheet(!showActionSheet)}
              style={{
                ...navButtonStyles,
                color: showActionSheet ? theme.accentBlue : theme.textSecondary,
              }}
              onMouseEnter={(e) => {
                if (!showActionSheet) {
                  e.currentTarget.style.background = theme.hover;
                  e.currentTarget.style.color = theme.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                if (!showActionSheet) {
                  e.currentTarget.style.color = theme.textSecondary;
                }
              }}
            >
              <span style={navIconStyles}>☰</span>
              <span>Menu</span>
            </button>
          )}

          {onFilter && (
            <button
              onClick={onFilter}
              style={navButtonStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.hover;
                e.currentTarget.style.color = theme.textPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = theme.textSecondary;
              }}
            >
              <span style={navIconStyles}>🔍</span>
              <span>Filter</span>
            </button>
          )}

          <button
            onClick={onAddTask}
            style={{
              ...navButtonStyles,
              background: theme.accentGreen,
              color: '#fff',
              fontWeight: '600',
              transform: 'scale(1.1)',
            }}
          >
            <span style={{ ...navIconStyles, fontSize: '2rem' }}>+</span>
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            style={{
              ...navButtonStyles,
              opacity: isSaving ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.background = theme.hover;
                e.currentTarget.style.color = theme.textPrimary;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = theme.textSecondary;
            }}
          >
            <span style={navIconStyles}>{isSaving ? '⏳' : '💾'}</span>
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </nav>

      {/* Action Sheet for Menu */}
      {showActionSheet && (
        <>
          <div
            style={actionSheetOverlayStyles}
            onClick={() => setShowActionSheet(false)}
          />
          <div style={actionSheetStyles}>
            <div
              style={{
                width: '40px',
                height: '4px',
                background: theme.border,
                borderRadius: '2px',
                margin: '0 auto 20px',
              }}
            />
            <h3
              style={{
                color: theme.textPrimary,
                marginBottom: '16px',
                fontSize: '1.2rem',
              }}
            >
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <TouchButton
                variant="secondary"
                icon="🤖"
                onClick={() => handleButtonClick(onOpenMenu)}
                fullWidth
              >
                AI Setup
              </TouchButton>
              <TouchButton
                variant="secondary"
                icon="📥"
                onClick={() => handleButtonClick(onOpenMenu)}
                fullWidth
              >
                Import Data
              </TouchButton>
              <TouchButton
                variant="secondary"
                icon="ℹ️"
                onClick={() => handleButtonClick(onOpenMenu)}
                fullWidth
              >
                Project Info
              </TouchButton>
              <TouchButton
                variant="ghost"
                icon="✕"
                onClick={() => setShowActionSheet(false)}
                fullWidth
              >
                Close
              </TouchButton>
            </div>
          </div>
        </>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          @keyframes slideDown {
            from { transform: translateY(0); }
            to { transform: translateY(100%); }
          }
        `}
      </style>
    </>
  );
};
