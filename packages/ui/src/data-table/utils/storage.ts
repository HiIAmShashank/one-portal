import type { PersistedTableState } from '../types';

const STORAGE_VERSION = '1.0.0';
const KEY_PREFIX = 'oneportal:datatable';

function getStorageKey(tableId: string): string {
  return `${KEY_PREFIX}:${tableId}:state`;
}

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

    if (parsed.version !== STORAGE_VERSION) {
      console.warn(`Table state version mismatch for ${tableId}. Expected ${STORAGE_VERSION}, got ${parsed.version}`);
      clearTableState(tableId);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error(`Failed to load table state for ${tableId}:`, error);
    return null;
  }
}

export function clearTableState(tableId: string): void {
  try {
    const key = getStorageKey(tableId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to clear table state for ${tableId}:`, error);
  }
}

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
