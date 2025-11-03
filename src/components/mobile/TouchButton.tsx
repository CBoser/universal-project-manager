/**
 * TouchButton Component
 * A button optimized for touch interactions with proper sizing and feedback
 *
 * Features:
 * - Minimum touch target size (44x44px for iOS)
 * - Touch feedback with active state
 * - Accessibility support
 * - Responsive sizing
 */

import React from 'react';
import { theme } from '../../config/theme';

export interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  loading = false,
  disabled,
  children,
  style,
  ...props
}) => {
  // Variant colors
  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      border: 'none',
    },
    secondary: {
      background: theme.accentBlue,
      color: '#fff',
      border: 'none',
    },
    success: {
      background: theme.accentGreen,
      color: '#fff',
      border: 'none',
    },
    danger: {
      background: theme.accentRed,
      color: '#fff',
      border: 'none',
    },
    warning: {
      background: theme.statusInProgress,
      color: theme.textPrimary,
      border: 'none',
    },
    ghost: {
      background: 'transparent',
      color: theme.textPrimary,
      border: `2px solid ${theme.border}`,
    },
  };

  // Size styles
  const sizeStyles = {
    small: {
      minHeight: '36px',
      padding: '8px 16px',
      fontSize: '0.85rem',
    },
    medium: {
      minHeight: theme.touchTarget.minHeight,
      padding: theme.touchTarget.padding,
      fontSize: '0.95rem',
    },
    large: {
      minHeight: '52px',
      padding: '16px 28px',
      fontSize: '1.1rem',
    },
  };

  const baseStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: fullWidth ? '100%' : 'auto',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: `all ${theme.transition.normal} ease`,
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  const [isPressed, setIsPressed] = React.useState(false);

  const handleTouchStart = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const activeStyles: React.CSSProperties = isPressed
    ? {
        transform: 'scale(0.97)',
        filter: 'brightness(0.9)',
      }
    : {};

  return (
    <button
      {...props}
      disabled={disabled || loading}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      style={{
        ...baseStyles,
        ...activeStyles,
      }}
    >
      {loading && (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      )}
      {icon && !loading && <span>{icon}</span>}
      {children}
    </button>
  );
};

// Add keyframe animation for loading spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
