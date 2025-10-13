// packages/auth/src/utils/formatAuthError.ts
// Formats MSAL errors into user-friendly messages with actionable guidance
// Requirements: T109 (Error Formatter), T110 (Error Messages), US7

import {
  AuthError,
  InteractionRequiredAuthError,
  BrowserAuthError,
} from '@azure/msal-browser';

/**
 * Structured authentication error with user-friendly content
 */
export interface FormattedAuthError {
  /** User-facing error title */
  title: string;
  /** Detailed description with guidance */
  description: string;
  /** Whether the error can be retried */
  isRetryable: boolean;
  /** Label for retry/action button */
  actionLabel?: string;
  /** Original MSAL error code for logging */
  errorCode?: string;
  /** Severity level for toast styling */
  severity: 'error' | 'warning' | 'info';
  /** Duration in milliseconds (default applies if not set) */
  duration?: number;
}

/**
 * Maps MSAL error codes to user-friendly messages
 * Handles common authentication scenarios per UX-002
 * 
 * @param error - Unknown error object from MSAL or network
 * @returns Formatted error with user-friendly messaging
 * 
 * @example
 * ```typescript
 * try {
 *   await msalInstance.acquireTokenSilent({ scopes });
 * } catch (error) {
 *   const formatted = formatAuthError(error);
 *   showAuthError(formatted);
 * }
 * ```
 */
export function formatAuthError(error: unknown): FormattedAuthError {
  // Handle InteractionRequiredAuthError - user needs to sign in again
  if (error instanceof InteractionRequiredAuthError) {
    return {
      title: 'Authentication Required',
      description: 'Your session has expired. Please sign in again to continue.',
      isRetryable: false,
      severity: 'warning',
      errorCode: error.errorCode,
      duration: 5000,
    };
  }

  // Handle BrowserAuthError - client-side authentication issues
  if (error instanceof BrowserAuthError) {
    // User cancelled sign-in popup/redirect
    if (error.errorCode === 'user_cancelled') {
      return {
        title: 'Sign-In Cancelled',
        description: 'You can try signing in again when ready.',
        isRetryable: true,
        actionLabel: 'Try Again',
        severity: 'info',
        errorCode: error.errorCode,
        duration: 4000,
      };
    }

    // Interaction in progress
    if (error.errorCode === 'interaction_in_progress') {
      return {
        title: 'Sign-In In Progress',
        description: 'Please complete the current sign-in process.',
        isRetryable: false,
        severity: 'info',
        errorCode: error.errorCode,
        duration: 3000,
      };
    }

    // Popup window closed
    if (error.errorCode === 'popup_window_error') {
      return {
        title: 'Sign-In Window Closed',
        description: 'The sign-in window was closed. Please try again.',
        isRetryable: true,
        actionLabel: 'Try Again',
        severity: 'warning',
        errorCode: error.errorCode,
        duration: 4000,
      };
    }

    // Generic browser auth error
    return {
      title: 'Authentication Error',
      description: error.errorMessage || 'Unable to complete authentication. Please try again.',
      isRetryable: true,
      actionLabel: 'Retry',
      severity: 'error',
      errorCode: error.errorCode,
      duration: 6000,
    };
  }

  // Handle AuthError base class
  if (error instanceof AuthError) {
    return {
      title: 'Authentication Error',
      description: error.errorMessage || 'An authentication error occurred. Please try again.',
      isRetryable: true,
      actionLabel: 'Retry',
      severity: 'error',
      errorCode: error.errorCode,
      duration: 6000,
    };
  }

  // Handle network errors (T110: Network failure scenario)
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    // Network/fetch errors
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection')
    ) {
      return {
        title: 'Network Error',
        description: 'Unable to connect to authentication service. Please check your internet connection and try again.',
        isRetryable: true,
        actionLabel: 'Retry',
        severity: 'error',
        duration: 6000,
      };
    }

    // CORS errors
    if (errorMessage.includes('cors')) {
      return {
        title: 'Configuration Error',
        description: 'Authentication service configuration issue. Please contact support.',
        isRetryable: false,
        severity: 'error',
        duration: 8000,
      };
    }

    // Generic error with message
    return {
      title: 'Unexpected Error',
      description: error.message || 'An unexpected error occurred. Please try again.',
      isRetryable: true,
      actionLabel: 'Retry',
      severity: 'error',
      duration: 6000,
    };
  }

  // Unknown error type - provide generic fallback
  return {
    title: 'Unexpected Error',
    description: 'An unexpected error occurred during authentication. Please try again or contact support if the issue persists.',
    isRetryable: true,
    actionLabel: 'Retry',
    severity: 'error',
    duration: 6000,
  };
}

/**
 * Common MSAL error codes reference:
 * 
 * InteractionRequiredAuthError:
 * - interaction_required: User interaction needed
 * - login_required: User needs to sign in
 * - consent_required: User needs to consent to permissions
 * 
 * BrowserAuthError:
 * - user_cancelled: User closed sign-in window/cancelled
 * - interaction_in_progress: Another auth operation is running
 * - popup_window_error: Popup window failed to open or was closed
 * - empty_window_error: Redirect window returned empty
 * - monitor_window_timeout: Window monitoring timed out
 * 
 * Network/Client Errors:
 * - network_error: Network request failed
 * - timeout: Request timed out
 * - cors: CORS policy blocked request
 * - invalid_grant: Invalid token/credentials
 */
