/**
 * @module @one-portal/auth/initialization
 * @description Handles MSAL initialization for both host and remote applications
 */

import { AuthErrorHandler } from '../errors';
import { publishAuthEvent } from '../events';
import { getLoginHint, safeRedirect } from '../utils';
import { isEmbeddedMode } from '../utils/environment';
import type {
    InitConfig,
    InitializationMode,
    InitializationState,
    InitializationResult,
    InitializationCallback,
    RouteType,
} from './types';

/**
 * Default route type detector based on pathname
 */
function defaultDetectRouteType(): RouteType {
    const path = window.location.pathname;
    if (path === '/sign-in') return 'public';
    if (path === '/auth/callback') return 'callback';
    return 'protected';
}

/**
 * Manages MSAL initialization for host and remote applications.
 * 
 * This class extracts initialization logic from UnifiedAuthProvider to:
 * - Separate concerns (initialization vs rendering)
 * - Improve testability
 * - Provide reusable initialization patterns
 * 
 * ## Host Mode (Shell)
 * - Performs quick cache check for protected routes
 * - Handles OAuth redirect flow
 * - Detects existing sessions
 * - Publishes auth events for remote apps
 * 
 * ## Remote Mode (Domino)
 * - Attempts SSO silent authentication
 * - Falls back to token acquisition if account exists
 * - Redirects to Shell if SSO fails (with visibility check)
 * - Optimized for lazy-loading (doesn't block render)
 * 
 * @example
 * ```typescript
 * const initializer = new MsalInitializer({
 *   msalInstance,
 *   appName: 'Shell',
 *   getAuthConfig: () => authConfig,
 *   debug: true,
 * });
 * 
 * // Subscribe to state changes
 * initializer.onStateChange((state) => {
 *   console.log('Initialization state:', state);
 * });
 * 
 * // Initialize in host mode
 * const result = await initializer.initialize('host');
 * if (result.success) {
 *   console.log('Initialization complete');
 * }
 * ```
 */
export class MsalInitializer {
    private config: InitConfig;
    private state: InitializationState;
    private callbacks: Set<InitializationCallback>;
    private isMounted: boolean;

    constructor(config: InitConfig) {
        this.config = config;
        this.state = {
            isInitializing: false,
            isInitialized: false,
            initError: null,
            hasQuickCheck: false,
        };
        this.callbacks = new Set();
        this.isMounted = true;
    }

    /**
     * Get current initialization state
     */
    public getState(): Readonly<InitializationState> {
        return { ...this.state };
    }

    /**
     * Subscribe to initialization state changes
     * @returns Unsubscribe function
     */
    public onStateChange(callback: InitializationCallback): () => void {
        this.callbacks.add(callback);
        return () => {
            this.callbacks.delete(callback);
        };
    }

    /**
     * Mark initializer as unmounted (prevents state updates after unmount)
     */
    public unmount(): void {
        this.isMounted = false;
    }

    /**
     * Initialize MSAL based on application mode
     * 
     * @param mode - 'host' for Shell, 'remote' for Domino
     * @param routeType - Optional route type (defaults to detected value)
     * @returns Initialization result
     */
    public async initialize(
        mode: InitializationMode,
        routeType?: RouteType
    ): Promise<InitializationResult> {
        if (this.state.isInitialized) {
            return { success: true };
        }

        // Perform quick cache check for host mode
        if (mode === 'host') {
            const quickCheckResult = this.performQuickCacheCheck(routeType);
            if (quickCheckResult) {
                return quickCheckResult;
            }
        } else {
            // Remote mode doesn't need quick check
            this.updateState({ hasQuickCheck: true });
        }

        // Start initialization
        this.updateState({ isInitializing: true, initError: null });

        try {
            if (mode === 'host') {
                await this.initializeHost();
            } else {
                await this.initializeRemote();
            }

            this.updateState({ isInitializing: false, isInitialized: true });
            return { success: true };
        } catch (error) {
            const initError = error instanceof Error ? error : new Error(String(error));
            this.updateState({
                isInitializing: false,
                isInitialized: true,
                initError,
            });
            return { success: false, error: initError };
        }
    }

    /**
     * Perform quick cache check for host mode on protected routes
     * 
     * This optimization prevents unnecessary MSAL initialization if:
     * - App is in host mode
     * - Current route is protected
     * - No MSAL cache exists (user not logged in)
     * 
     * @returns Result if quick check completed, null if full initialization needed
     */
    private performQuickCacheCheck(routeType?: RouteType): InitializationResult | null {
        const detectRouteType = this.config.detectRouteType || defaultDetectRouteType;
        const detectedRouteType = routeType || detectRouteType();

        if (detectedRouteType === 'protected') {
            // Check if MSAL cache exists
            const hasMsalCache = Object.keys(localStorage).some((key) => key.startsWith('msal.'));

            if (!hasMsalCache) {
                // No cache, user needs to sign in - skip full initialization
                this.updateState({
                    hasQuickCheck: true,
                    isInitialized: true,
                });
                return { success: true, quickCheckFailed: true };
            }
        }

        this.updateState({ hasQuickCheck: true });
        return null; // Proceed with full initialization
    }

    /**
     * Initialize authentication for host app (Shell)
     * 
     * Handles:
     * - OAuth redirect flow
     * - Existing session detection
     * - Auth event publishing
     * - Return URL navigation
     */
    private async initializeHost(): Promise<void> {
        const { msalInstance, appName, getAuthConfig, debug } = this.config;

        try {
            await msalInstance.initialize();
            const response = await msalInstance.handleRedirectPromise();

            if (!this.isMounted) return;

            if (response) {
                // User just completed OAuth redirect
                if (debug) {
                    console.log(`[${appName}] Login successful:`, response.account.username);
                }

                const loginHint = getLoginHint(response.account);
                const accountId = response.account.homeAccountId;

                publishAuthEvent('auth:signed-in', {
                    loginHint,
                    accountId,
                    appName,
                    clientId: getAuthConfig().clientId,
                });

                // Handle return URL
                const urlParams = new URLSearchParams(window.location.search);
                const returnUrl = urlParams.get('returnUrl');

                if (returnUrl) {
                    if (debug) {
                        console.log(`[${appName}] Redirecting to:`, returnUrl);
                    }
                    safeRedirect(decodeURIComponent(returnUrl), '/');
                    return;
                }
            } else {
                // Check for existing session
                const accounts = msalInstance.getAllAccounts();

                if (accounts.length === 0) {
                    if (debug) {
                        console.log(`[${appName}] No accounts found, user needs to sign in`);
                    }
                } else {
                    const account = accounts[0];
                    if (!account) return; // Type guard

                    msalInstance.setActiveAccount(account);

                    publishAuthEvent('auth:signed-in', {
                        loginHint: getLoginHint(account),
                        accountId: account.homeAccountId,
                        appName,
                        clientId: getAuthConfig().clientId,
                    });

                    if (debug) {
                        console.log(`[${appName}] Existing session found:`, account.username);
                    }
                }
            }
        } catch (error) {
            console.error(`[${appName}] Initialization failed:`, error);

            const processed = AuthErrorHandler.process(error, `${appName} initialization`);
            AuthErrorHandler.show(processed);

            publishAuthEvent('auth:error', {
                error: {
                    code: processed.code,
                    message: processed.message,
                    timestamp: Date.now(),
                    appName,
                },
            });

            throw error;
        }
    }

    /**
     * Initialize authentication for remote app (Domino)
     * 
     * Handles:
     * - SSO silent authentication
     * - Token acquisition from existing accounts
     * - Fallback to Shell redirect (with visibility check)
     * - Embedded vs standalone mode detection
     * 
     * **CRITICAL**: Checks document visibility to prevent redirects during route preloading
     */
    private async initializeRemote(): Promise<void> {
        const { msalInstance, appName, getAuthConfig, debug } = this.config;

        try {
            await msalInstance.initialize();
            await msalInstance.handleRedirectPromise();

            if (!this.isMounted) return;

            const accounts = msalInstance.getAllAccounts();

            if (accounts.length > 0) {
                // Try to use existing account
                const account = accounts[0];
                if (!account) return; // Type guard

                msalInstance.setActiveAccount(account);

                try {
                    await msalInstance.acquireTokenSilent({
                        scopes: getAuthConfig().scopes,
                        account,
                    });

                    if (debug) {
                        console.log(`[${appName}] Token acquired silently`);
                    }
                } catch (error: unknown) {
                    // Token refresh failed, try SSO
                    try {
                        const ssoResult = await msalInstance.ssoSilent({
                            scopes: getAuthConfig().scopes,
                            loginHint: account.username,
                        });
                        msalInstance.setActiveAccount(ssoResult.account);

                        if (debug) {
                            console.log(`[${appName}] SSO successful with existing account`);
                        }
                    } catch (ssoError) {
                        this.handleSSOFailure(ssoError);
                    }
                }
            } else {
                // No accounts, try SSO without loginHint
                try {
                    const ssoResult = await msalInstance.ssoSilent({
                        scopes: getAuthConfig().scopes,
                    });
                    msalInstance.setActiveAccount(ssoResult.account);

                    if (debug) {
                        console.log(`[${appName}] SSO successful without existing account`);
                    }
                } catch (error) {
                    this.handleSSOFailure(error);
                }
            }
        } catch (error) {
            console.error(`[${appName}] Initialization failed:`, error);

            // Only show error if not redirecting to Shell
            const embedded = isEmbeddedMode({ mode: getAuthConfig().mode });
            if (!embedded && import.meta.env.DEV) {
                const processed = AuthErrorHandler.process(error, `${appName} initialization`);
                AuthErrorHandler.show(processed);
            }

            // Don't throw - allow initialization to complete
        }
    }

    /**
     * Handle SSO failure with visibility check
     * 
     * Only redirects if document is visible (prevents redirects during route preloading)
     */
    private handleSSOFailure(error: unknown): void {
        const { appName, debug, getAuthConfig } = this.config;
        const embedded = isEmbeddedMode({ mode: getAuthConfig().mode });

        if (!embedded && import.meta.env.DEV) {
            if (debug) {
                console.log(`[${appName}] SSO failed in standalone mode, skipping redirect`);
            }
        } else if (document.visibilityState === 'visible') {
            // Only redirect if user actually navigated to this page
            console.error(`[${appName}] SSO failed, redirecting to Shell:`, error);
            const returnUrl = encodeURIComponent(window.location.href);
            safeRedirect(`/?returnUrl=${returnUrl}`, '/');
        } else {
            // Route was preloaded but not visible - don't redirect
            if (debug) {
                console.log(`[${appName}] SSO failed (preloaded route), skipping redirect`);
            }
        }
    }

    /**
     * Update internal state and notify subscribers
     */
    private updateState(updates: Partial<InitializationState>): void {
        this.state = { ...this.state, ...updates };
        this.callbacks.forEach((callback) => callback(this.state));
    }
}
