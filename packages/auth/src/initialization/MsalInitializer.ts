/**
 * @module @one-portal/auth/initialization
 * @description Handles MSAL initialization for both host and remote applications
 */

import { AuthErrorHandler } from "../errors";
import { publishAuthEvent } from "../events";
import { getLoginHint, safeRedirect } from "../utils";
import { isEmbeddedMode } from "../utils/environment";
import type {
  InitConfig,
  InitializationMode,
  InitializationState,
  InitializationResult,
  InitializationCallback,
  RouteType,
} from "./types";

/**
 * Default route type detector based on pathname
 */
function defaultDetectRouteType(): RouteType {
  const path = window.location.pathname;
  if (path === "/sign-in") return "public";
  if (path === "/auth/callback") return "callback";
  return "protected";
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
    routeType?: RouteType,
  ): Promise<InitializationResult> {
    if (this.state.isInitialized) {
      return { success: true };
    }

    // Perform quick cache check for host mode
    if (mode === "host") {
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
      if (mode === "host") {
        await this.initializeHost();
      } else {
        await this.initializeRemote();
      }

      this.updateState({ isInitializing: false, isInitialized: true });
      return { success: true };
    } catch (error) {
      const initError =
        error instanceof Error ? error : new Error(String(error));
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
  private performQuickCacheCheck(
    routeType?: RouteType,
  ): InitializationResult | null {
    const detectRouteType =
      this.config.detectRouteType || defaultDetectRouteType;
    const detectedRouteType = routeType || detectRouteType();

    if (detectedRouteType === "protected") {
      // Check if MSAL cache exists
      const hasMsalCache = Object.keys(localStorage).some((key) =>
        key.startsWith("msal."),
      );

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
          console.info(
            `[${appName}] Login successful:`,
            response.account.username,
          );
        }

        const loginHint = getLoginHint(response.account);
        const accountId = response.account.homeAccountId;

        publishAuthEvent("auth:signed-in", {
          loginHint,
          accountId,
          appName,
          clientId: getAuthConfig().clientId,
        });

        // Handle return URL
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get("returnUrl");

        if (returnUrl) {
          if (debug) {
            console.info(`[${appName}] Redirecting to:`, returnUrl);
          }
          safeRedirect(decodeURIComponent(returnUrl), "/");
          return;
        }
      } else {
        // Check for existing session
        const accounts = msalInstance.getAllAccounts();

        if (accounts.length === 0) {
          if (debug) {
            console.info(
              `[${appName}] No accounts found, user needs to sign in`,
            );
          }
        } else {
          const account = accounts[0];
          if (!account) return; // Type guard

          msalInstance.setActiveAccount(account);

          publishAuthEvent("auth:signed-in", {
            loginHint: getLoginHint(account),
            accountId: account.homeAccountId,
            appName,
            clientId: getAuthConfig().clientId,
          });

          if (debug) {
            console.info(
              `[${appName}] Existing session found:`,
              account.username,
            );
          }
        }
      }
    } catch (error) {
      console.error(`[${appName}] Initialization failed:`, error);

      const processed = AuthErrorHandler.process(
        error,
        `${appName} initialization`,
      );
      AuthErrorHandler.show(processed);

      publishAuthEvent("auth:error", {
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
   * Determines if app is embedded or standalone, then delegates to appropriate method.
   *
   * **Embedded Mode**: App runs inside Shell via Module Federation
   * - Uses SSO silent authentication only
   * - Redirects to Shell sign-in on failure
   *
   * **Standalone Mode**: App runs independently
   * - Tries SSO first, then falls back to interactive redirect
   * - Requires Azure AD OAuth redirect URI configuration
   */
  private async initializeRemote(): Promise<void> {
    const { getAuthConfig } = this.config;
    const embedded = isEmbeddedMode({ mode: getAuthConfig().mode });

    if (embedded) {
      await this.initializeRemoteEmbedded();
    } else {
      await this.initializeRemoteStandalone();
    }
  }

  /**
   * Initialize authentication for remote app in embedded mode
   *
   * Handles:
   * - SSO silent authentication
   * - Token acquisition from existing accounts
   * - Fallback to Shell redirect (with visibility check)
   *
   * **CRITICAL**: Checks document visibility to prevent redirects during route preloading
   */
  private async initializeRemoteEmbedded(): Promise<void> {
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
            console.info(`[${appName}] Token acquired silently`);
          }
        } catch (_error: unknown) {
          // Token refresh failed, try SSO
          try {
            const ssoResult = await msalInstance.ssoSilent({
              scopes: getAuthConfig().scopes,
              loginHint: account.username,
            });
            msalInstance.setActiveAccount(ssoResult.account);

            if (debug) {
              console.info(`[${appName}] SSO successful with existing account`);
            }
          } catch (_ssoError) {
            this.handleSSOFailureEmbedded(_ssoError);
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
            console.info(
              `[${appName}] SSO successful without existing account`,
            );
          }
        } catch (error) {
          this.handleSSOFailureEmbedded(error);
        }
      }
    } catch (error) {
      console.error(`[${appName}] Embedded initialization failed:`, error);
      // Don't throw - allow initialization to complete
    }
  }

  /**
   * Initialize authentication for remote app in standalone mode
   *
   * Handles:
   * - OAuth redirect promise (returning from Azure AD)
   * - SSO silent authentication attempt
   * - Interactive redirect on SSO failure
   *
   * **Security Note**: This method ensures standalone remotes always require authentication
   */
  private async initializeRemoteStandalone(): Promise<void> {
    const { msalInstance, appName, getAuthConfig, debug } = this.config;

    try {
      await msalInstance.initialize();
      const response = await msalInstance.handleRedirectPromise();

      if (!this.isMounted) return;

      // Check if returning from OAuth redirect
      if (response) {
        if (debug) {
          console.info(
            `[${appName}] Standalone login successful:`,
            response.account.username,
          );
        }
        msalInstance.setActiveAccount(response.account);

        const loginHint = getLoginHint(response.account);
        const accountId = response.account.homeAccountId;

        publishAuthEvent("auth:signed-in", {
          loginHint,
          accountId,
          appName,
          clientId: getAuthConfig().clientId,
        });
        return;
      }

      // Try SSO silent authentication
      const accounts = msalInstance.getAllAccounts();

      if (accounts.length > 0) {
        const account = accounts[0];
        if (!account) return; // Type guard

        msalInstance.setActiveAccount(account);

        try {
          await msalInstance.acquireTokenSilent({
            scopes: getAuthConfig().scopes,
            account,
          });

          if (debug) {
            console.info(`[${appName}] Standalone token acquired silently`);
          }
          return;
        } catch (_error: unknown) {
          // Token refresh failed, try SSO
          try {
            const ssoResult = await msalInstance.ssoSilent({
              scopes: getAuthConfig().scopes,
              loginHint: account.username,
            });
            msalInstance.setActiveAccount(ssoResult.account);

            if (debug) {
              console.info(`[${appName}] Standalone SSO successful`);
            }
            return;
          } catch (_ssoError) {
            // Fall through to interactive login
            if (debug) {
              console.info(
                `[${appName}] SSO failed, initiating interactive login`,
              );
            }
          }
        }
      }

      // No existing session or SSO failed - trigger interactive login
      if (debug) {
        console.info(
          `[${appName}] No session found, redirecting to Azure AD for authentication`,
        );
      }

      await msalInstance.loginRedirect({
        scopes: getAuthConfig().scopes,
        prompt: "select_account",
      });
    } catch (error) {
      console.error(`[${appName}] Standalone initialization failed:`, error);
      const processed = AuthErrorHandler.process(
        error,
        `${appName} initialization`,
      );
      AuthErrorHandler.show(processed);
      throw error;
    }
  }

  /**
   * Handle SSO failure in embedded mode with visibility check
   *
   * Only redirects to Shell if document is visible (prevents redirects during route preloading)
   */
  private handleSSOFailureEmbedded(error: unknown): void {
    const { appName, debug } = this.config;

    if (document.visibilityState === "visible") {
      // Only redirect if user actually navigated to this page
      console.error(
        `[${appName}] SSO failed in embedded mode, redirecting to Shell:`,
        error,
      );
      const returnUrl = encodeURIComponent(window.location.href);
      safeRedirect(`/?returnUrl=${returnUrl}`, "/");
    } else {
      // Route was preloaded but not visible - don't redirect
      if (debug) {
        console.info(
          `[${appName}] SSO failed (preloaded route), skipping redirect`,
        );
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
