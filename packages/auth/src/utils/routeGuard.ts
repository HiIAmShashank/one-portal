// packages/auth/src/utils/routeGuard.ts
// Route guard utility for TanStack Router with auth checks

import type { PublicClientApplication } from '@azure/msal-browser';

/**
 * Route guard configuration
 */
export interface RouteGuardConfig {
  msalInstance: PublicClientApplication;
  scopes: string[];
  onUnauthenticated?: (returnUrl: string) => void;
  onAuthError?: (error: Error) => void;
}

/**
 * Check if user is authenticated
 * Returns true if user has valid account, false otherwise
 */
export function isAuthenticated(msalInstance: PublicClientApplication): boolean {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0;
}

/**
 * Attempt silent SSO authentication
 * Returns true if successful, false otherwise
 * 
 * NOTE: This function is kept for potential future use, but should NOT be called
 * from route guards as it causes iframe errors when no user is signed in.
 */
export async function attemptSilentAuth(
  msalInstance: PublicClientApplication,
  scopes: string[]
): Promise<boolean> {
  try {
    const accounts = msalInstance.getAllAccounts();
    
    if (accounts.length > 0) {
      // Try to acquire token silently with existing account
      await msalInstance.acquireTokenSilent({
        scopes,
        account: accounts[0],
      });
      return true;
    }
    
    // No accounts - don't try ssoSilent as it will fail
    return false;
  } catch (error) {
    // Silent auth failed - expected when user is not signed in
    return false;
  }
}

/**
 * Create a beforeLoad function for TanStack Router route protection
 * 
 * @param config Route guard configuration
 * @returns beforeLoad function that checks authentication
 * 
 * IMPORTANT: This function checks if the user is authenticated.
 * If not, it redirects to the sign-in page. It does NOT call ssoSilent()
 * to avoid creating hidden iframes that cause errors when no user is signed in.
 * 
 * @example
 * ```tsx
 * export const Route = createRootRoute({
 *   beforeLoad: createRouteGuard({
 *     msalInstance,
 *     scopes: ['User.Read'],
 *     onUnauthenticated: (returnUrl) => {
 *       window.location.href = `/?returnUrl=${encodeURIComponent(returnUrl)}`;
 *     }
 *   })
 * })
 * ```
 */
export function createRouteGuard(config: RouteGuardConfig) {
  return async ({ 
    location,
  }: { 
    location: { href: string };
  }) => {
    const { msalInstance, onUnauthenticated, onAuthError } = config;
    
    try {
      // Check if user has account
      if (!isAuthenticated(msalInstance)) {
        // User not authenticated - redirect to sign-in
        // DO NOT call ssoSilent() here - it causes iframe errors!
        if (onUnauthenticated) {
          onUnauthenticated(location.href);
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (onAuthError) {
        onAuthError(err);
      } else {
        console.error('[RouteGuard] Auth check failed:', err);
      }
    }
  };
}

/**
 * Check if error is interaction_required error from MSAL
 */
export function isInteractionRequired(error: unknown): boolean {
  if (error && typeof error === 'object' && 'errorCode' in error) {
    const errorCode = (error as { errorCode: string }).errorCode;
    return errorCode === 'interaction_required' || 
           errorCode === 'login_required' ||
           errorCode === 'consent_required';
  }
  return false;
}
