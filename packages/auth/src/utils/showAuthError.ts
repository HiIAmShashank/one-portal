// packages/auth/src/utils/showAuthError.ts
// Toast-based error display using Sonner
// Requirements: T111 (Update error display), T112 (Retry button), US7

import { toast } from '@one-portal/ui';
import { formatAuthError, FormattedAuthError } from './formatAuthError';

/**
 * Displays authentication error as a Sonner toast notification
 * Replaces AuthErrorAlert component with toast-based UX
 * 
 * @param error - Unknown error from MSAL or network
 * @param onRetry - Optional callback for retry button (only shown for retryable errors)
 * @param options - Optional configuration including screen reader callback
 * 
 * @example
 * ```typescript
 * // Network error with retry
 * try {
 *   await msalInstance.acquireTokenSilent({ scopes });
 * } catch (error) {
 *   showAuthError(error, () => {
 *     // Retry token acquisition
 *     handleAcquireToken();
 *   });
 * }
 * 
 * // With screen reader announcement
 * showAuthError(error, handleRetry, {
 *   announceToScreenReader: (msg) => setAriaLiveMessage(msg)
 * });
 * ```
 */
export function showAuthError(
  error: unknown,
  onRetry?: () => void,
  options?: {
    announceToScreenReader?: (message: string) => void;
  }
): void {
  const formatted = formatAuthError(error);
  displayFormattedError(formatted, onRetry, options);
}

/**
 * Displays a pre-formatted authentication error as a toast
 * Useful when you need to customize the error before display
 * 
 * @param formatted - Pre-formatted error object
 * @param onRetry - Optional callback for retry button
 * @param options - Optional configuration including screen reader callback
 */
export function displayFormattedError(
  formatted: FormattedAuthError,
  onRetry?: () => void,
  options?: {
    announceToScreenReader?: (message: string) => void;
  }
): void {
  const toastOptions = {
    description: formatted.description,
    duration: formatted.duration,
    // Add retry button only if error is retryable AND callback provided (T112)
    ...(formatted.isRetryable && onRetry && {
      action: {
        label: formatted.actionLabel || 'Retry',
        onClick: onRetry,
      },
    }),
  };

  // Display toast based on severity level
  switch (formatted.severity) {
    case 'error':
      toast.error(formatted.title, toastOptions);
      break;
    case 'warning':
      toast.warning(formatted.title, toastOptions);
      break;
    case 'info':
      toast.info(formatted.title, toastOptions);
      break;
    default:
      toast(formatted.title, toastOptions);
  }

  // Announce to screen reader if callback provided (T114: US7)
  if (options?.announceToScreenReader) {
    const announcement = `${formatted.title}. ${formatted.description}`;
    options.announceToScreenReader(announcement);
  }

  // Log error for telemetry (dev mode only for now, T118 will add proper logging)
  if (process.env.NODE_ENV === 'development') {
    console.error('[Auth Error]', {
      title: formatted.title,
      description: formatted.description,
      errorCode: formatted.errorCode,
      severity: formatted.severity,
      isRetryable: formatted.isRetryable,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Shows a loading toast that can be updated to success or error
 * Useful for async operations like token acquisition
 * 
 * @param promise - Promise to track
 * @param messages - Custom messages for loading, success, and error states
 * 
 * @example
 * ```typescript
 * showAuthPromise(
 *   msalInstance.acquireTokenSilent({ scopes }),
 *   {
 *     loading: 'Acquiring access token...',
 *     success: 'Successfully authenticated',
 *     error: (err) => formatAuthError(err).title
 *   }
 * );
 * ```
 */
export function showAuthPromise<T>(
  promise: Promise<T>,
  messages?: {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((error: unknown) => string);
  }
): void {
  toast.promise(promise, {
    loading: messages?.loading || 'Authenticating...',
    success: messages?.success || 'Authentication successful',
    error: (error: unknown) => {
      if (typeof messages?.error === 'function') {
        return messages.error(error);
      }
      if (typeof messages?.error === 'string') {
        return messages.error;
      }
      // Default: format the error
      const formatted = formatAuthError(error);
      return formatted.title;
    },
  });
}
