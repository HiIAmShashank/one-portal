import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import type { AuthState, UseAuthReturn, UserProfile } from '../types/auth';
import { acquireToken } from '../utils/acquireToken';

/**
 * Enhanced authentication hook that abstracts MSAL dependency from apps.
 * 
 * Provides a clean, type-safe API for authentication operations without
 * requiring apps to directly import from @azure/msal-react.
 * 
 * This hook implements the UseAuthReturn interface and can be used as a
 * drop-in replacement for the context-based useAuth.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     state: { isAuthenticated, account },
 *     login,
 *     logout,
 *     hasRole,
 *   } = useAuth();
 * 
 *   if (!isAuthenticated) {
 *     return <button onClick={login}>Sign In</button>;
 *   }
 * 
 *   return (
 *     <div>
 *       <p>Welcome, {account?.name}!</p>
 *       {hasRole('admin') && <AdminPanel />}
 *       <button onClick={logout}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Acquiring tokens for API calls
 * async function callApi() {
 *   const { acquireToken } = useAuth();
 *   
 *   try {
 *     const token = await acquireToken(['User.Read']);
 *     if (!token) throw new Error('Failed to acquire token');
 *     
 *     const response = await fetch('/api/data', {
 *       headers: { Authorization: `Bearer ${token}` }
 *     });
 *     return response.json();
 *   } catch (error) {
 *     console.error('API call failed:', error);
 *   }
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
    const { instance, accounts, inProgress } = useMsal();
    const [error, setError] = useState<any>(null);

    // Current account
    const account = accounts[0] ?? null;

    // Build user profile from account claims
    const userProfile: UserProfile | null = account ? {
        id: account.homeAccountId,
        email: account.username,
        name: account.name ?? account.username,
        roles: (account.idTokenClaims as any)?.roles as string[] | undefined,
        groups: (account.idTokenClaims as any)?.groups as string[] | undefined,
        tenantId: account.tenantId,
    } : null;

    // Auth state
    const state: AuthState = {
        isInitialized: true, // MSAL handles initialization
        isAuthenticated: accounts.length > 0,
        isLoading: inProgress !== InteractionStatus.None,
        account,
        userProfile,
        error,
    };

    /**
     * Sign in the user with interactive login redirect.
     * 
     * The user will be redirected to Azure AD for authentication,
     * then returned to the application.
     * 
     * @example
     * ```tsx
     * // Basic login
     * await login();
     * ```
     */
    const login = useCallback(async (): Promise<void> => {
        try {
            setError(null);
            await instance.loginRedirect({
                scopes: ['openid', 'profile', 'email'],
                prompt: 'select_account',
            });
        } catch (err) {
            console.error('[useAuth] Login failed:', err);
            setError(err);
            throw err;
        }
    }, [instance]);

    /**
     * Sign out the user and clear session.
     * 
     * The user will be redirected to Azure AD to clear their session,
     * then returned to the application.
     * 
     * @param postLogoutRedirectUri - Optional redirect URI after logout (defaults to window.location.origin)
     * 
     * @example
     * ```tsx
     * // Basic logout
     * await logout();
     * 
     * // Logout with custom redirect
     * await logout('/sign-in?signed-out=true');
     * ```
     */
    const logout = useCallback(async (postLogoutRedirectUri?: string): Promise<void> => {
        try {
            setError(null);
            await instance.logoutRedirect({
                account: account ?? undefined,
                postLogoutRedirectUri: postLogoutRedirectUri ?? window.location.origin,
            });
        } catch (err) {
            console.error('[useAuth] Logout failed:', err);
            setError(err);
            throw err;
        }
    }, [instance, account]);

    /**
     * Acquire an access token for the specified scopes.
     * 
     * Attempts silent token acquisition first, falls back to interactive if needed.
     * 
     * @param scopes - OAuth scopes to request
     * @returns Access token string or null if acquisition fails
     * 
     * @example
     * ```tsx
     * // Acquire token for Microsoft Graph
     * const token = await acquireToken(['User.Read']);
     * 
     * // Use token in API call
     * if (token) {
     *   const response = await fetch('https://graph.microsoft.com/v1.0/me', {
     *     headers: { Authorization: `Bearer ${token}` }
     *   });
     * }
     * ```
     */
    const acquireTokenSilent = useCallback(async (scopes: string[]): Promise<string | null> => {
        if (!account) {
            console.error('[useAuth] No account available for token acquisition');
            return null;
        }

        try {
            setError(null);
            const result = await acquireToken({
                msalInstance: instance,
                account,
                scopes,
            });
            return result.accessToken;
        } catch (err) {
            console.error('[useAuth] Token acquisition failed:', err);
            setError(err);
            return null;
        }
    }, [instance, account]);

    /**
     * Check if the current user has specific role(s).
     * 
     * Checks the 'roles' claim in the ID token.
     * 
     * @param roles - Single role or array of roles to check
     * @returns True if user has any of the specified roles
     * 
     * @example
     * ```tsx
     * // Check single role
     * if (hasRole('admin')) {
     *   return <AdminPanel />;
     * }
     * 
     * // Check multiple roles (OR logic)
     * if (hasRole(['admin', 'moderator'])) {
     *   return <ModeratorPanel />;
     * }
     * ```
     */
    const hasRole = useCallback((roles: string | string[]): boolean => {
        if (!account?.idTokenClaims) return false;

        const userRoles = (account.idTokenClaims as any).roles as string[] | undefined;
        if (!userRoles || !Array.isArray(userRoles)) return false;

        const rolesToCheck = Array.isArray(roles) ? roles : [roles];
        return rolesToCheck.some(role => userRoles.includes(role));
    }, [account]);

    /**
     * Clear the current authentication error.
     * 
     * Useful for dismissing error messages or resetting error state.
     * 
     * @example
     * ```tsx
     * // Clear error after user dismisses error message
     * <ErrorMessage error={state.error} onDismiss={clearError} />
     * ```
     */
    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    return {
        state,
        login,
        logout,
        acquireToken: acquireTokenSilent,
        hasRole,
        clearError,
    };
}

