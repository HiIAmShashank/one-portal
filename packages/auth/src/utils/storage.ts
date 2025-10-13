// packages/auth/src/utils/storage.ts
// Utilities for interacting with auth storage

/**
 * Storage key prefix for OnePortal auth data
 */
const STORAGE_PREFIX = 'oneportal.auth.';

/**
 * Get item from localStorage with prefix
 * @param key - Storage key (without prefix)
 * @returns Stored value or null
 */
export function getStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error('[Storage] Failed to get item:', error);
    return null;
  }
}

/**
 * Set item in localStorage with prefix
 * @param key - Storage key (without prefix)
 * @param value - Value to store
 */
export function setStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
  } catch (error) {
    console.error('[Storage] Failed to set item:', error);
  }
}

/**
 * Remove item from localStorage with prefix
 * @param key - Storage key (without prefix)
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error('[Storage] Failed to remove item:', error);
  }
}

/**
 * Clear all OnePortal auth data from localStorage
 */
export function clearAuthStorage(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('[Storage] Failed to clear auth storage:', error);
  }
}

/**
 * Store return URL for post-login navigation
 * @param url - URL to return to after authentication
 */
export function setReturnUrl(url: string): void {
  setStorageItem('returnUrl', url);
}

/**
 * Get and clear stored return URL
 * @returns Return URL or null
 */
export function getAndClearReturnUrl(): string | null {
  const url = getStorageItem('returnUrl');
  if (url) {
    removeStorageItem('returnUrl');
  }
  return url;
}

/**
 * Check if storage is available (some browsers block localStorage)
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
