import type { PublicClientApplication } from '@azure/msal-browser';
import { createRouteGuard, type MsalRouteGuardConfig } from '../utils/routeGuard';
import { AuthErrorHandler } from '../errors/AuthErrorHandler';

/**
 * Options for configuring route guard presets.
 */
export interface RouteGuardOptions {
    /**
     * OAuth scopes to request during authentication.
     * @default ['openid', 'profile', 'email']
     */
    scopes?: string[];

    /**
     * Custom handler for unauthenticated users.
     * If not provided, redirects to `/sign-in?returnUrl=...`
     * 
     * @param returnUrl - The URL the user was trying to access
     */
    onUnauthenticated?: (returnUrl: string) => void;

    /**
     * Custom handler for authentication errors.
     * If not provided, uses AuthErrorHandler to show toast notification.
     * 
     * @param error - The error that occurred
     */
    onAuthError?: (error: Error) => void;

    /**
     * Skip redirect during route preloading.
     * Set to true for lazy-loaded routes to prevent redirects during preload phase.
     * 
     * @default false
     */
    skipRedirectOnPreload?: boolean;

    /**
     * Custom sign-in route path.
     * @default '/sign-in'
     */
    signInRoute?: string;
}

/**
 * Create a route guard for protected routes with standard configuration.
 * 
 * Uses sensible defaults:
 * - Standard scopes: `['openid', 'profile', 'email']`
 * - Redirects to `/sign-in?returnUrl=...` for unauthenticated users
 * - Shows error toast notifications via AuthErrorHandler
 * - Works with TanStack Router's beforeLoad hook
 * 
 * @param msalInstance - The MSAL instance to use for authentication
 * @param options - Optional configuration overrides
 * 
 * @example
 * ```tsx
 * // Basic usage - Host app
 * export const Route = createRootRoute({
 *   beforeLoad: createProtectedRouteGuard(msalInstance),
 *   component: RootLayout,
 * });
 * ```
 * 
 * @example
 * ```tsx
 * // Lazy-loaded remote app
 * export const Route = createRootRoute({
 *   beforeLoad: createProtectedRouteGuard(msalInstance, {
 *     skipRedirectOnPreload: true,
 *   }),
 *   component: RootLayout,
 * });
 * ```
 * 
 * @example
 * ```tsx
 * // Custom configuration
 * export const Route = createRootRoute({
 *   beforeLoad: createProtectedRouteGuard(msalInstance, {
 *     scopes: ['User.Read', 'Mail.Read'],
 *     onUnauthenticated: (returnUrl) => {
 *       window.location.href = `/custom-login?return=${returnUrl}`;
 *     },
 *   }),
 *   component: RootLayout,
 * });
 * ```
 */
export function createProtectedRouteGuard(
    msalInstance: PublicClientApplication,
    options: RouteGuardOptions = {}
) {
    const {
        scopes = ['openid', 'profile', 'email'],
        signInRoute = '/sign-in',
        onUnauthenticated,
        onAuthError,
        skipRedirectOnPreload = false,
    } = options;

    const config: MsalRouteGuardConfig = {
        msalInstance,
        scopes,
        onUnauthenticated: onUnauthenticated ?? ((returnUrl: string) => {
            // Default: redirect to sign-in with return URL
            const signInUrl = `${signInRoute}?returnUrl=${encodeURIComponent(returnUrl)}`;
            window.location.href = signInUrl;
        }),
        onAuthError: onAuthError ?? ((error: Error) => {
            // Default: show error toast via AuthErrorHandler
            console.error('[RouteGuard] Authentication error:', error);
            AuthErrorHandler.show(error);
        }),
    };

    const guard = createRouteGuard(config);

    // If skipRedirectOnPreload is enabled, wrap the guard to check preload context
    if (skipRedirectOnPreload) {
        return async ({ location, preload }: { location: { href: string }; preload?: boolean }) => {
            // Don't run guard during route preload (lazy-loaded routes)
            if (preload) {
                console.log('[RouteGuard] Skipping guard during preload:', location.href);
                return;
            }
            return guard({ location });
        };
    }

    return guard;
}

/**
 * Create a route guard for public routes (no authentication required).
 * 
 * This is a no-op guard that always allows access.
 * Use this to explicitly mark routes as public for documentation purposes.
 * 
 * @example
 * ```tsx
 * // Sign-in page
 * export const Route = createFileRoute('/sign-in')({
 *   beforeLoad: createPublicRouteGuard(),
 *   component: SignInPage,
 * });
 * ```
 * 
 * @example
 * ```tsx
 * // Public landing page
 * export const Route = createFileRoute('/public')({
 *   beforeLoad: createPublicRouteGuard(),
 *   component: PublicPage,
 * });
 * ```
 */
export function createPublicRouteGuard() {
    return async () => {
        // No-op: public routes don't require authentication
    };
}

/**
 * Create a route guard for OAuth callback routes.
 * 
 * Handles the OAuth redirect from Azure AD after user authentication.
 * Extracts the code/token from the URL and completes the authentication flow.
 * 
 * @param msalInstance - The MSAL instance to use for handling the callback
 * 
 * @example
 * ```tsx
 * // OAuth callback page
 * export const Route = createFileRoute('/auth/callback')({
 *   beforeLoad: createCallbackRouteGuard(msalInstance),
 *   component: CallbackPage,
 * });
 * ```
 */
export function createCallbackRouteGuard(msalInstance: PublicClientApplication) {
    return async () => {
        try {
            // Handle redirect promise to complete authentication
            await msalInstance.handleRedirectPromise();
            console.log('[RouteGuard] OAuth callback handled successfully');
        } catch (error) {
            console.error('[RouteGuard] OAuth callback failed:', error);
            AuthErrorHandler.show(error);
            // Don't throw - let the callback page handle the error state
        }
    };
}

/**
 * Utility to check if a route is public based on path.
 * 
 * @param pathname - The route pathname to check
 * @param publicRoutes - Array of public route paths (default: ['/sign-in', '/auth/callback'])
 * @returns true if the route is public
 * 
 * @example
 * ```tsx
 * export const Route = createRootRoute({
 *   beforeLoad: async ({ location }) => {
 *     if (isPublicRoute(location.pathname)) {
 *       return; // Skip authentication
 *     }
 *     return createProtectedRouteGuard(msalInstance)({ location });
 *   },
 * });
 * ```
 */
export function isPublicRoute(
    pathname: string,
    publicRoutes: string[] = ['/sign-in', '/auth/callback']
): boolean {
    return publicRoutes.includes(pathname);
}
