/**
 * TouchButton Component
 * A touch-friendly button with visual feedback for both mouse and touch interactions
 * Follows iOS Human Interface Guidelines for touch targets
 */

import React, { useState, CSSProperties } from 'react';
import { theme } from '../config/theme';
import { useDeviceCapabilities } from '../hooks/useTouchDevice';

interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  style?: CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  style,
  type = 'button',
  ariaLabel,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const { isTouch } = useDeviceCapabilities();

  // Get variant styles
  const variantStyles = getVariantStyles(variant);

  // Get size styles
  const sizeStyles = getSizeStyles(size);

  // Combined styles
  const buttonStyle: CSSProperties = {
    ...sizeStyles,
    ...variantStyles.base,
    width: fullWidth ? '100%' : 'auto',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : isPressed ? 0.8 : 1,
    transform: isPressed && !disabled ? 'scale(0.98)' : 'scale(1)',
    transition: `all ${theme.transition.fast} ease`,
    position: 'relative',
    overflow: 'hidden',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    ...style,
  };

  const handlePress = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handleRelease = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={buttonStyle}
      onMouseDown={!isTouch ? handlePress : undefined}
      onMouseUp={!isTouch ? handleRelease : undefined}
      onMouseLeave={!isTouch ? handleRelease : undefined}
      onTouchStart={isTouch ? handlePress : undefined}
      onTouchEnd={isTouch ? handleRelease : undefined}
    >
      {children}
    </button>
  );
};

// Variant style configurations
function getVariantStyles(variant: 'primary' | 'secondary' | 'danger' | 'ghost') {
  switch (variant) {
    case 'primary':
      return {
        base: {
          background: theme.accentBlue,
          color: 'white',
        },
      };
    case 'secondary':
      return {
        base: {
          background: theme.bgTertiary,
          color: theme.textPrimary,
        },
      };
    case 'danger':
      return {
        base: {
          background: theme.accentRed,
          color: 'white',
        },
      };
    case 'ghost':
      return {
        base: {
          background: 'transparent',
          color: theme.textPrimary,
          border: `1px solid ${theme.border}`,
        },
      };
    default:
      return {
        base: {
          background: theme.accentBlue,
          color: 'white',
        },
      };
  }
}

// Size style configurations
function getSizeStyles(size: 'small' | 'medium' | 'large') {
  switch (size) {
    case 'small':
      return {
        padding: '8px 16px',
        minHeight: '36px',
        fontSize: '0.9rem',
      };
    case 'medium':
      return {
        padding: theme.touchTarget.padding,
        minHeight: theme.touchTarget.minHeight,
        fontSize: '1rem',
      };
    case 'large':
      return {
        padding: '16px 32px',
        minHeight: '52px',
        fontSize: '1.1rem',
      };
    default:
      return {
        padding: theme.touchTarget.padding,
        minHeight: theme.touchTarget.minHeight,
        fontSize: '1rem',
      };
  }
}

/**
 * IconButton Component
 * A circular touch-friendly button for icons
 */
interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel: string;
  style?: CSSProperties;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  disabled = false,
  ariaLabel,
  style,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const { isTouch } = useDeviceCapabilities();

  const buttonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: theme.touchTarget.minWidth,
    minHeight: theme.touchTarget.minHeight,
    width: theme.touchTarget.minWidth,
    height: theme.touchTarget.minHeight,
    background: 'transparent',
    border: 'none',
    borderRadius: '50%',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : isPressed ? 0.8 : 1,
    transform: isPressed && !disabled ? 'scale(0.95)' : 'scale(1)',
    transition: `all ${theme.transition.fast} ease`,
    color: theme.textPrimary,
    WebkitTapHighlightColor: 'transparent',
    ...style,
  };

  const handlePress = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handleRelease = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={buttonStyle}
      onMouseDown={!isTouch ? handlePress : undefined}
      onMouseUp={!isTouch ? handleRelease : undefined}
      onMouseLeave={!isTouch ? handleRelease : undefined}
      onTouchStart={isTouch ? handlePress : undefined}
      onTouchEnd={isTouch ? handleRelease : undefined}
      onMouseEnter={!disabled && !isTouch ? (e) => {
        e.currentTarget.style.background = theme.hover;
      } : undefined}
      onMouseLeave={!disabled && !isTouch ? (e) => {
        e.currentTarget.style.background = 'transparent';
      } : undefined}
    >
      {icon}
    </button>
  );
};
