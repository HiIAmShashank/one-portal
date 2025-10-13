import { AuthError, InteractionRequiredAuthError } from '@azure/msal-browser';

/**
 * Check if error is authentication-related
 * 
 * Used by React Query to skip retries for auth errors.
 * Auth errors (401/403) should not be retried - user needs to sign in.
 * 
 * @param error - The error to check
 * @returns true if error is authentication-related
 * 
 * @example
 * ```typescript
 * const queryClient = new QueryClient({
 *   defaultOptions: {
 *     queries: {
 *       retry: (failureCount, error) => {
 *         if (isAuthError(error)) {
 *           return false; // Don't retry auth errors
 *         }
 *         return failureCount < 2;
 *       },
 *     },
 *   },
 * });
 * ```
 * 
 * Requirements: US7 (Error Handling), FR-010 (Error Telemetry)
 */
export function isAuthError(error: unknown): boolean {
  if (!error) return false;
  
  // Check for HTTP 401 Unauthorized or 403 Forbidden
  if (error instanceof Error && 'status' in error) {
    const status = (error as any).status;
    return status === 401 || status === 403;
  }
  
  // Check for MSAL authentication errors
  if (error instanceof AuthError || error instanceof InteractionRequiredAuthError) {
    return true;
  }
  
  // Check for response objects with status codes
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any;
    if (errorObj.response?.status === 401 || errorObj.response?.status === 403) {
      return true;
    }
  }
  
  return false;
}
