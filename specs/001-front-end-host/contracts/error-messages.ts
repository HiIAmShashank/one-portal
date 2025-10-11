/**
 * Error Messages Registry
 * Feature: 001-front-end-host
 * 
 * Centralized error messages for consistent UX across the shell.
 * All user-facing error messages should reference this file.
 * 
 * Usage:
 *   import { ERROR_MESSAGES } from './contracts/error-messages';
 *   throw new Error(ERROR_MESSAGES.REMOTE_APP.LOAD_FAILED('Billing App'));
 */

export const ERROR_MESSAGES = {
  /**
   * Remote Application Loading Errors
   */
  REMOTE_APP: {
    /**
     * Remote app failed to load (network, module error, etc.)
     * @param appName - Display name of the app that failed to load
     */
    LOAD_FAILED: (appName: string) =>
      `Unable to load ${appName}. Please try again or contact support if the problem persists.`,

    /**
     * Remote app mount/render failed after loading
     * @param appName - Display name of the app
     */
    MOUNT_FAILED: (appName: string) =>
      `${appName} could not be displayed. Please refresh the page or contact support.`,

    /**
     * Generic remote app error fallback
     */
    GENERIC_ERROR: 'An unexpected error occurred while loading the application. Please try again.',
  },

  /**
   * Configuration API Errors
   */
  CONFIG_API: {
    /**
     * Failed to fetch shell configuration from API
     */
    FETCH_FAILED:
      'Configuration unavailable. Using offline mode with limited apps. Please check your connection.',

    /**
     * API returned invalid/malformed configuration
     */
    INVALID_RESPONSE:
      'Configuration data is invalid. Please contact support if this issue continues.',

    /**
     * Network timeout while fetching configuration
     */
    TIMEOUT:
      'Connection timeout while loading configuration. Please check your network and retry.',

    /**
     * API returned error status (500, 403, etc.)
     */
    SERVER_ERROR:
      'Server error while loading configuration. Our team has been notified. Please try again later.',
  },

  /**
   * Navigation & Routing Errors
   */
  NAVIGATION: {
    /**
     * Invalid app ID in URL
     * @param appId - The invalid app identifier
     */
    INVALID_APP_ID: (appId: string) =>
      `Application "${appId}" not found. Please select a valid app from the navigation menu.`,

    /**
     * Navigation failed (generic)
     */
    NAVIGATION_FAILED:
      'Navigation failed. Please try again or use the menu to select an application.',
  },

  /**
   * Preference & Theme Errors
   */
  PREFERENCES: {
    /**
     * Failed to save preferences to localStorage
     */
    SAVE_FAILED:
      'Unable to save your preferences. Changes may not persist after refresh.',

    /**
     * Failed to load preferences from localStorage
     */
    LOAD_FAILED:
      'Unable to load saved preferences. Using default settings.',

    /**
     * Theme application failed
     */
    THEME_ERROR:
      'Theme could not be applied. Please try refreshing the page.',
  },

  /**
   * Browser Compatibility Errors
   */
  COMPATIBILITY: {
    /**
     * Browser not supported
     */
    UNSUPPORTED_BROWSER:
      'Your browser is not supported. Please use Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+.',

    /**
     * localStorage not available
     */
    NO_LOCAL_STORAGE:
      'Browser storage is disabled. Some features may not work correctly.',
  },

  /**
   * Generic fallback errors
   */
  GENERIC: {
    /**
     * Unexpected error with no specific handler
     */
    UNEXPECTED:
      'An unexpected error occurred. Please refresh the page or contact support.',

    /**
     * Feature not yet implemented (development)
     */
    NOT_IMPLEMENTED:
      'This feature is not yet available. Please check back later.',
  },
} as const;

/**
 * Error codes for programmatic error handling
 */
export enum ErrorCode {
  // Remote App Errors (1xxx)
  REMOTE_LOAD_FAILED = 'ERR_1001',
  REMOTE_MOUNT_FAILED = 'ERR_1002',
  REMOTE_GENERIC = 'ERR_1000',

  // Config API Errors (2xxx)
  CONFIG_FETCH_FAILED = 'ERR_2001',
  CONFIG_INVALID = 'ERR_2002',
  CONFIG_TIMEOUT = 'ERR_2003',
  CONFIG_SERVER_ERROR = 'ERR_2004',

  // Navigation Errors (3xxx)
  NAV_INVALID_APP = 'ERR_3001',
  NAV_FAILED = 'ERR_3002',

  // Preference Errors (4xxx)
  PREF_SAVE_FAILED = 'ERR_4001',
  PREF_LOAD_FAILED = 'ERR_4002',
  PREF_THEME_ERROR = 'ERR_4003',

  // Compatibility Errors (5xxx)
  COMPAT_UNSUPPORTED = 'ERR_5001',
  COMPAT_NO_STORAGE = 'ERR_5002',

  // Generic Errors (9xxx)
  GENERIC_UNEXPECTED = 'ERR_9000',
  GENERIC_NOT_IMPLEMENTED = 'ERR_9999',
}

/**
 * Helper to create error with code and message
 */
export class ShellError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'ShellError';
  }
}
