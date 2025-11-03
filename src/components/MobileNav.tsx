/**
 * Mobile Navigation Component
 * Provides a slide-out navigation drawer for mobile devices
 * Based on iOS/Material Design patterns
 */

import React, { useEffect } from 'react';
import { theme } from '../config/theme';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onLogout: () => void;
  onNavigate: (page: 'dashboard' | 'settings' | 'users' | 'timelogs') => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onNavigate,
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: `opacity ${theme.transition.normal} ease, visibility ${theme.transition.normal} ease`,
          zIndex: theme.zIndex.modal - 1,
          backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
      />

      {/* Navigation Drawer */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '80%',
          maxWidth: '320px',
          background: theme.bgSecondary,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: `transform ${theme.transition.normal} ease`,
          zIndex: theme.zIndex.modal,
          overflowY: 'auto',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.3)',
          paddingTop: theme.safeArea.top,
          paddingBottom: theme.safeArea.bottom,
          paddingLeft: `max(${theme.safeArea.left}, 1rem)`,
          paddingRight: '1rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 0',
            borderBottom: `1px solid ${theme.border}`,
            marginBottom: '1rem',
          }}
        >
          <h2 style={{ margin: 0, color: theme.textPrimary, fontSize: '1.25rem' }}>
            Menu
          </h2>
          {currentUser && (
            <div style={{ marginTop: '0.5rem', color: theme.textMuted, fontSize: '0.9rem' }}>
              {currentUser.name}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavItem
            icon="🏠"
            label="Dashboard"
            onClick={() => {
              onNavigate('dashboard');
              onClose();
            }}
          />
          <NavItem
            icon="⚙️"
            label="Settings"
            onClick={() => {
              onNavigate('settings');
              onClose();
            }}
          />
          <NavItem
            icon="👥"
            label="User Management"
            onClick={() => {
              onNavigate('users');
              onClose();
            }}
          />
          <NavItem
            icon="⏱️"
            label="Time Logs"
            onClick={() => {
              onNavigate('timelogs');
              onClose();
            }}
          />
        </div>

        {/* Logout Button */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '2rem',
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            style={{
              width: '100%',
              padding: theme.touchTarget.padding,
              minHeight: theme.touchTarget.minHeight,
              background: theme.accentRed,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: `all ${theme.transition.fast} ease`,
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Logout
          </button>
        </div>
      </nav>
    </>
  );
};

interface NavItemProps {
  icon: string;
  label: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        width: '100%',
        padding: theme.touchTarget.padding,
        minHeight: theme.touchTarget.minHeight,
        background: 'transparent',
        color: theme.textPrimary,
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        textAlign: 'left',
        cursor: 'pointer',
        transition: `all ${theme.transition.fast} ease`,
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.background = theme.active;
        e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.background = theme.active;
        e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = theme.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

/**
 * Hamburger Menu Button Component
 * Displays a hamburger icon that animates to an X when active
 */
interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const HamburgerButton: React.FC<HamburgerButtonProps> = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: theme.touchTarget.minWidth,
        height: theme.touchTarget.minHeight,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '10px',
        position: 'relative',
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.opacity = '0.7';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.opacity = '0.7';
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
    >
      {/* Top line */}
      <span
        style={{
          display: 'block',
          width: '24px',
          height: '2px',
          background: theme.textPrimary,
          borderRadius: '2px',
          transition: `all ${theme.transition.normal} ease`,
          transform: isOpen ? 'rotate(45deg) translateY(8px)' : 'none',
          marginBottom: isOpen ? '0' : '5px',
        }}
      />

      {/* Middle line */}
      <span
        style={{
          display: 'block',
          width: '24px',
          height: '2px',
          background: theme.textPrimary,
          borderRadius: '2px',
          transition: `all ${theme.transition.normal} ease`,
          opacity: isOpen ? 0 : 1,
          marginBottom: isOpen ? '0' : '5px',
        }}
      />

      {/* Bottom line */}
      <span
        style={{
          display: 'block',
          width: '24px',
          height: '2px',
          background: theme.textPrimary,
          borderRadius: '2px',
          transition: `all ${theme.transition.normal} ease`,
          transform: isOpen ? 'rotate(-45deg) translateY(-8px)' : 'none',
        }}
      />
    </button>
  );
};
