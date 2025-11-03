// ============================================
// Universal Project Manager - Theme Configuration
// ============================================

export const theme = {
  // Background colors
  bgPrimary: '#0b0f14',
  bgSecondary: '#0e141b',
  bgTertiary: '#141b24',

  // Text colors
  textPrimary: '#e6eef8',
  textSecondary: '#a8b5c7',
  textMuted: '#6a7891',

  // Brand colors
  brandOrange: '#ff7b00',
  brandNavy: '#103A56',
  accentBlue: '#00A3FF',
  accentTeal: '#00d4aa',
  accentGreen: '#4caf50',
  accentRed: '#f44336',
  accentPurple: '#9c27b0',
  accentOrange: '#ff5722',

  // UI colors
  border: '#2a3441',
  hover: '#1a2332',
  active: '#0f1419',

  // Status colors
  statusPending: '#6c757d',
  statusInProgress: '#ffc107',
  statusComplete: '#4caf50',
  statusBlocked: '#f44336',

  // Phase colors (default palette)
  phaseColors: {
    phase1: '#00A3FF',
    phase2: '#00d4aa',
    phase3: '#4caf50',
    phase4: '#ff7b00',
    phase5: '#9c27b0',
    phase6: '#ff5722',
    phase7: '#f44336',
  },

  // Responsive breakpoints (in pixels)
  breakpoints: {
    mobile: 640,
    tablet: 1024,
    desktop: 1280,
  },

  // Spacing scale (mobile, tablet, desktop)
  spacing: {
    xs: { mobile: '0.25rem', tablet: '0.25rem', desktop: '0.25rem' },  // 4px
    sm: { mobile: '0.5rem', tablet: '0.75rem', desktop: '0.75rem' },   // 8-12px
    md: { mobile: '1rem', tablet: '1.25rem', desktop: '1.5rem' },      // 16-24px
    lg: { mobile: '1.5rem', tablet: '2rem', desktop: '2.5rem' },       // 24-40px
    xl: { mobile: '2rem', tablet: '3rem', desktop: '4rem' },           // 32-64px
  },

  // Font sizes (mobile, tablet, desktop)
  fontSize: {
    xs: { mobile: '0.75rem', tablet: '0.8rem', desktop: '0.85rem' },   // 12-13.6px
    sm: { mobile: '0.85rem', tablet: '0.9rem', desktop: '0.95rem' },   // 13.6-15.2px
    base: { mobile: '0.95rem', tablet: '1rem', desktop: '1rem' },      // 15.2-16px
    lg: { mobile: '1.1rem', tablet: '1.25rem', desktop: '1.5rem' },    // 17.6-24px
    xl: { mobile: '1.5rem', tablet: '2rem', desktop: '2.5rem' },       // 24-40px
    '2xl': { mobile: '2rem', tablet: '2.5rem', desktop: '3rem' },      // 32-48px
  },

  // Touch-friendly minimum sizes
  touchTarget: {
    minHeight: '44px',  // iOS Human Interface Guidelines
    minWidth: '44px',
    padding: '12px 20px',
  },

  // iOS safe area insets (CSS variables)
  safeArea: {
    top: 'env(safe-area-inset-top)',
    right: 'env(safe-area-inset-right)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)',
  },

  // Transition durations
  transition: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
  },

  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    modal: 1030,
    popover: 1040,
    tooltip: 1050,
  },
};

// Helper functions for responsive values
export const getResponsiveValue = (
  size: 'mobile' | 'tablet' | 'desktop',
  valueObj: { mobile: string; tablet: string; desktop: string }
): string => {
  return valueObj[size];
};

// Media query helpers
export const mediaQueries = {
  mobile: `(max-width: ${theme.breakpoints.mobile - 1}px)`,
  tablet: `(min-width: ${theme.breakpoints.mobile}px) and (max-width: ${theme.breakpoints.tablet - 1}px)`,
  desktop: `(min-width: ${theme.breakpoints.tablet}px)`,
  touch: '(hover: none) and (pointer: coarse)',
};

// Get current device size based on window width
export const getCurrentDeviceSize = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  if (width < theme.breakpoints.mobile) return 'mobile';
  if (width < theme.breakpoints.tablet) return 'tablet';
  return 'desktop';
};
