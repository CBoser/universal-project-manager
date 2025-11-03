/**
 * useTouchDevice Hook
 * Detects if the current device has touch capability
 */

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the device supports touch
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    // Check multiple indicators of touch support
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - older browsers
      navigator.msMaxTouchPoints > 0
    );
  });

  useEffect(() => {
    // Double-check on mount in case initial detection was wrong
    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - older browsers
      navigator.msMaxTouchPoints > 0;

    if (hasTouch !== isTouch) {
      setIsTouch(hasTouch);
    }
  }, [isTouch]);

  return isTouch;
}

/**
 * Hook to check if device prefers hover (desktop mouse)
 * Returns true for desktop with mouse, false for touch devices
 */
export function useHoverCapable(): boolean {
  const [canHover, setCanHover] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;

    // Use media query to detect hover capability
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });

  useEffect(() => {
    // Listen for changes in hover capability (e.g., connecting mouse to tablet)
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    const handleChange = (e: MediaQueryListEvent) => {
      setCanHover(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return canHover;
}

/**
 * Hook that returns both touch and hover capabilities
 */
export function useDeviceCapabilities() {
  const isTouch = useTouchDevice();
  const canHover = useHoverCapable();

  return {
    isTouch,
    canHover,
    isPureTouch: isTouch && !canHover, // Touch device without mouse
    isHybrid: isTouch && canHover, // Device with both touch and mouse
  };
}
