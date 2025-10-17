/**
 * localStorage utilities for DataTable state persistence
 * @module data-table/utils/storage
 */

import type { PersistedTableState } from '../types';

const STORAGE_VERSION = '1.0.0';
const KEY_PREFIX = 'oneportal-datatable';

/**
 * Generate localStorage key for a table
 */
export function getStorageKey(tableId: string): string {
  return `${KEY_PREFIX}-${tableId}-state`;
}

/**
 * Save table state to localStorage
 */
export function saveTableState(
  tableId: string,
  state: Omit<PersistedTableState, 'version' | 'timestamp'>
): void {
  try {
    const key = getStorageKey(tableId);
    const persistedState: PersistedTableState = {
      ...state,
      version: STORAGE_VERSION,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(persistedState));
  } catch (error) {
    console.error(`Failed to save table state for ${tableId}:`, error);
  }
}

/**
 * Load table state from localStorage
 * Returns null if not found or invalid
 */
export function loadTableState(tableId: string): PersistedTableState | null {
  try {
    const key = getStorageKey(tableId);
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as PersistedTableState;
    
    // Validate version (for future migration support)
    if (parsed.version !== STORAGE_VERSION) {
      console.warn(`Table state version mismatch for ${tableId}. Expected ${STORAGE_VERSION}, got ${parsed.version}`);
      // For now, clear old version data
      clearTableState(tableId);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error(`Failed to load table state for ${tableId}:`, error);
    return null;
  }
}

/**
 * Clear table state from localStorage
 */
export function clearTableState(tableId: string): void {
  try {
    const key = getStorageKey(tableId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to clear table state for ${tableId}:`, error);
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
