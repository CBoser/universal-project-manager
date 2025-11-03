/**
 * useMediaQuery Hook
 * Provides responsive design capabilities by detecting screen size changes
 */

import { useState, useEffect } from 'react';
import { theme } from '../config/theme';

type DeviceSize = 'mobile' | 'tablet' | 'desktop';

/**
 * Hook to detect current device size based on breakpoints
 */
export function useMediaQuery(): DeviceSize {
  const [deviceSize, setDeviceSize] = useState<DeviceSize>(() => {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width < theme.breakpoints.mobile) return 'mobile';
    if (width < theme.breakpoints.tablet) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newSize: DeviceSize;

      if (width < theme.breakpoints.mobile) {
        newSize = 'mobile';
      } else if (width < theme.breakpoints.tablet) {
        newSize = 'tablet';
      } else {
        newSize = 'desktop';
      }

      if (newSize !== deviceSize) {
        setDeviceSize(newSize);
      }
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away to set initial size
    handleResize();

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [deviceSize]);

  return deviceSize;
}

/**
 * Hook to check if current screen matches a specific size
 */
export function useIsDevice(targetDevice: DeviceSize): boolean {
  const currentDevice = useMediaQuery();
  return currentDevice === targetDevice;
}

/**
 * Hook to check if screen is mobile or smaller
 */
export function useIsMobile(): boolean {
  const device = useMediaQuery();
  return device === 'mobile';
}

/**
 * Hook to check if screen is tablet
 */
export function useIsTablet(): boolean {
  const device = useMediaQuery();
  return device === 'tablet';
}

/**
 * Hook to check if screen is desktop or larger
 */
export function useIsDesktop(): boolean {
  const device = useMediaQuery();
  return device === 'desktop';
}

/**
 * Hook to check if screen is mobile or tablet (not desktop)
 */
export function useIsMobileOrTablet(): boolean {
  const device = useMediaQuery();
  return device === 'mobile' || device === 'tablet';
}
