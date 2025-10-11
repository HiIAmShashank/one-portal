/**
 * localStorage key constants for OnePortal
 * Centralized storage key management for consistency
 */

export const STORAGE_KEYS = {
  /**
   * User preferences (theme, language)
   * @example { theme: 'dark', language: 'en' }
   */
  PREFERENCES: 'oneportal:preferences',

  /**
   * Shell configuration cache
   * @example { apps: [...], branding: {...} }
   */
  SHELL_CONFIG: 'oneportal:config',

  /**
   * Active application ID
   * @example "billing"
   */
  ACTIVE_APP: 'oneportal:activeApp',

  /**
   * Last visited route
   * @example "/apps/billing"
   */
  LAST_ROUTE: 'oneportal:lastRoute',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
