// ============================================
// Universal Project Manager - Storage Service
// ============================================

import { STORAGE_KEY } from '../config/constants';

/**
 * Local storage service for persisting project data
 */
export const storageService = {
  /**
   * Save data to localStorage
   */
  save(data: any): void {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  },

  /**
   * Load data from localStorage
   */
  load(): any | null {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized === null) {
        return null;
      }
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      return null;
    }
  },

  /**
   * Clear all data from localStorage
   */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },

  /**
   * Check if data exists in localStorage
   */
  exists(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  },

  /**
   * Export data as downloadable file
   */
  exportAsFile(filename: string, data: any): void {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data as file:', error);
    }
  },
};
