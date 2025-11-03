/**
 * Logout Button Component
 * Reusable logout button that can be placed anywhere in the app
 */

import React, { useState } from 'react';
import { theme } from '../config/theme';
import { useDeviceCapabilities } from '../hooks/useTouchDevice';

interface LogoutButtonProps {
  onLogout: () => void;
  variant?: 'text' | 'button' | 'icon';
  size?: 'small' | 'medium' | 'large';
  showConfirm?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  onLogout,
  variant = 'button',
  size = 'medium',
  showConfirm = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const { isTouch } = useDeviceCapabilities();

  const handleLogout = () => {
    if (showConfirm) {
      if (confirm('Are you sure you want to log out?')) {
        onLogout();
      }
    } else {
      onLogout();
    }
  };

  const handlePress = () => setIsPressed(true);
  const handleRelease = () => setIsPressed(false);

  // Style variants
  const getStyles = () => {
    const baseStyles = {
      cursor: 'pointer',
      transition: `all ${theme.transition.fast} ease`,
      opacity: isPressed ? 0.8 : 1,
      transform: isPressed ? 'scale(0.98)' : 'scale(1)',
      WebkitTapHighlightColor: 'transparent',
      border: 'none',
      fontFamily: 'inherit',
      userSelect: 'none' as const,
    };

    switch (variant) {
      case 'text':
        return {
          ...baseStyles,
          background: 'transparent',
          color: theme.accentRed,
          padding: size === 'small' ? '4px 8px' : size === 'large' ? '12px 20px' : '8px 16px',
          fontSize: size === 'small' ? '0.9rem' : size === 'large' ? '1.1rem' : '1rem',
          fontWeight: '500',
        };
      case 'icon':
        return {
          ...baseStyles,
          background: 'transparent',
          color: theme.textPrimary,
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: theme.touchTarget.minWidth,
          minHeight: theme.touchTarget.minHeight,
          fontSize: '1.5rem',
        };
      default: // button
        return {
          ...baseStyles,
          background: theme.accentRed,
          color: 'white',
          padding: size === 'small' ? '8px 16px' : size === 'large' ? '16px 32px' : theme.touchTarget.padding,
          borderRadius: '8px',
          fontSize: size === 'small' ? '0.9rem' : size === 'large' ? '1.1rem' : '1rem',
          fontWeight: '500',
          minHeight: size === 'small' ? '36px' : size === 'large' ? '52px' : theme.touchTarget.minHeight,
        };
    }
  };

  const getContent = () => {
    switch (variant) {
      case 'icon':
        return '🚪';
      case 'text':
        return 'Logout';
      default:
        return 'Logout';
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={getStyles()}
      onMouseDown={!isTouch ? handlePress : undefined}
      onMouseUp={!isTouch ? handleRelease : undefined}
      onMouseLeave={!isTouch ? handleRelease : undefined}
      onTouchStart={isTouch ? handlePress : undefined}
      onTouchEnd={isTouch ? handleRelease : undefined}
      onMouseEnter={!isTouch && variant === 'icon' ? (e) => {
        e.currentTarget.style.background = theme.hover;
      } : undefined}
      onMouseLeave={!isTouch && variant === 'icon' ? (e) => {
        e.currentTarget.style.background = 'transparent';
      } : undefined}
      aria-label="Logout"
      title="Logout"
    >
      {getContent()}
    </button>
  );
};
