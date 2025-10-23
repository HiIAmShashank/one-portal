import type { AuthError as AuthErrorType } from '../types/auth';

/**
 * Error codes that indicate user should retry with interactive login
 */
const INTERACTION_REQUIRED_CODES = [
  'interaction_required',
  'consent_required',
  'login_required',
  'claims_challenge',
];

/**
 * Error codes that are transient and may succeed on retry
 */
const TRANSIENT_ERROR_CODES = [
  'network_error',
  'timeout',
  'service_unavailable',
  'temporarily_unavailable',
];

/**
 * @deprecated Use `AuthErrorHandler.process()` instead.
 * This function will be removed in a future version.
 * 
 * Migration example:
 * ```typescript
 * // Old:
 * const parsed = parseAuthError(error, 'Login');
 * 
 * // New:
 * const processed = AuthErrorHandler.process(error, 'Login');
 * ```
 */
export function parseAuthError(error: unknown, context?: string): AuthErrorType {
  const timestamp = new Date();

  // Handle MSAL errors
  if (isMsalError(error)) {
    const code = error.errorCode;
    const message = error.errorMessage;
    const subError = error.subError;

    return {
      code,
      message: context ? `${context}: ${message}` : message,
      subError,
      isActionable: INTERACTION_REQUIRED_CODES.includes(code),
      retryAction: getRetryAction(code),
      timestamp,
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      code: 'unknown_error',
      message: context ? `${context}: ${error.message}` : error.message,
      isActionable: false,
      timestamp,
    };
  }

  // Handle unknown error types
  return {
    code: 'unknown_error',
    message: context || 'An unknown error occurred',
    isActionable: false,
    timestamp,
  };
}

/**
 * Type guard for MSAL errors
 */
function isMsalError(error: unknown): error is {
  errorCode: string;
  errorMessage: string;
  subError?: string;
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errorCode' in error &&
    'errorMessage' in error &&
    typeof (error as any).errorCode === 'string' &&
    typeof (error as any).errorMessage === 'string'
  );
}

/**
 * Determine suggested retry action based on error code
 */
function getRetryAction(code: string): AuthErrorType['retryAction'] {
  if (INTERACTION_REQUIRED_CODES.includes(code)) {
    return 'login';
  }
  if (TRANSIENT_ERROR_CODES.includes(code)) {
    return 'refresh';
  }
  if (code.includes('admin') || code.includes('consent')) {
    return 'contact-admin';
  }
  return undefined;
}

/**
 * @deprecated Use `AuthErrorHandler.isTransient()` instead.
 * This function will be removed in a future version.
 * 
 * Migration example:
 * ```typescript
 * // Old:
 * if (isTransientError(error)) { ... }
 * 
 * // New:
 * if (AuthErrorHandler.isTransient(error)) { ... }
 * ```
 */
export function isTransientError(error: AuthErrorType | unknown): boolean {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as AuthErrorType).code;
    return TRANSIENT_ERROR_CODES.includes(code);
  }
  return false;
}

/**
 * @deprecated Use `AuthErrorHandler.getMessage()` or `AuthErrorHandler.process()` instead.
 * This function will be removed in a future version.
 * 
 * Migration example:
 * ```typescript
 * // Old:
 * const message = getUserFriendlyErrorMessage(error);
 * 
 * // New:
 * const message = AuthErrorHandler.getMessage(error);
 * // Or for full details:
 * const processed = AuthErrorHandler.process(error);
 * const message = processed.description;
 * ```
 */
export function getUserFriendlyErrorMessage(error: AuthErrorType): string {
  switch (error.code) {
    case 'interaction_required':
    case 'consent_required':
    case 'login_required':
      return 'Please sign in to continue.';

    case 'network_error':
    case 'timeout':
      return 'Network error. Please check your connection and try again.';

    case 'service_unavailable':
    case 'temporarily_unavailable':
      return 'Service temporarily unavailable. Please try again later.';

    case 'invalid_grant':
      return 'Your session has expired. Please sign in again.';

    case 'user_cancelled':
      return 'Sign-in was cancelled.';

    default:
      return error.message || 'An error occurred during authentication.';
  }
}
