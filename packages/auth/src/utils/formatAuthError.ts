import {
  AuthError,
  InteractionRequiredAuthError,
  BrowserAuthError,
} from '@azure/msal-browser';

export interface FormattedAuthError {
  title: string;
  description: string;
  isRetryable: boolean;
  actionLabel?: string;
  errorCode?: string;
  severity: 'error' | 'warning' | 'info';
  duration?: number;
}

/**
 * @deprecated Use `AuthErrorHandler.process()` instead.
 * This function will be removed in a future version.
 * 
 * Migration example:
 * ```typescript
 * // Old:
 * const formatted = formatAuthError(error);
 * 
 * // New:
 * const processed = AuthErrorHandler.process(error);
 * ```
 */
export function formatAuthError(error: unknown): FormattedAuthError {
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

  if (error instanceof BrowserAuthError) {
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

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

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

    if (errorMessage.includes('cors')) {
      return {
        title: 'Configuration Error',
        description: 'Authentication service configuration issue. Please contact support.',
        isRetryable: false,
        severity: 'error',
        duration: 8000,
      };
    }

    return {
      title: 'Unexpected Error',
      description: error.message || 'An unexpected error occurred. Please try again.',
      isRetryable: true,
      actionLabel: 'Retry',
      severity: 'error',
      duration: 6000,
    };
  }

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
 * MSAL error codes reference:
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
