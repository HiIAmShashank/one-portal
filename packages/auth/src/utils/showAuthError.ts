import { toast } from '@one-portal/ui';
import { formatAuthError, FormattedAuthError } from './formatAuthError';

/**
 * @deprecated Use `AuthErrorHandler.show()` instead.
 * This function will be removed in a future version.
 * 
 * Migration example:
 * ```typescript
 * // Old:
 * showAuthError(error, onRetry, { announceToScreenReader });
 * 
 * // New:
 * AuthErrorHandler.show(error, { onRetry, announceToScreenReader });
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
 * @deprecated Use `AuthErrorHandler.show()` with pre-processed error instead.
 * This function will be removed in a future version.
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

  if (options?.announceToScreenReader) {
    const announcement = `${formatted.title}. ${formatted.description}`;
    options.announceToScreenReader(announcement);
  }

  if (import.meta.env.DEV) {
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
 * @deprecated Use `AuthErrorHandler.showPromise()` instead.
 * This function will be removed in a future version.
 * 
 * Migration example:
 * ```typescript
 * // Old:
 * showAuthPromise(promise, { loading, success, error });
 * 
 * // New:
 * AuthErrorHandler.showPromise(promise, { loading, success, error });
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
      const formatted = formatAuthError(error);
      return formatted.title;
    },
  });
}
