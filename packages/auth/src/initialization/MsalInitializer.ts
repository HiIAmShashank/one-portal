/**
 * @module @one-portal/auth/initialization
 * @description Handles MSAL initialization for both host and remote applications
 */

import { AuthErrorHandler } from "../errors";
import { publishAuthEvent } from "../events";
import { getLoginHint, safeRedirect, getAndClearReturnUrl } from "../utils";
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
    // Reset mounted flag for React Strict Mode remounts
    this.isMounted = true;

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

        // CRITICAL: Set the active account BEFORE any redirects
        // This ensures route guards can see the authenticated state
        msalInstance.setActiveAccount(response.account);

        const loginHint = getLoginHint(response.account);
        const accountId = response.account.homeAccountId;

        publishAuthEvent("auth:signed-in", {
          loginHint,
          accountId,
          appName,
          clientId: getAuthConfig().clientId,
        });

        // Handle return URL redirect after successful authentication
        const returnUrl = getAndClearReturnUrl();
        if (returnUrl) {
          if (debug) {
            console.info(`[${appName}] Redirecting to returnUrl:`, returnUrl);
          }
          safeRedirect(returnUrl, "/");
        } else {
          if (debug) {
            console.info(
              `[${appName}] No returnUrl found, staying on current page`,
            );
          }
        }
        return;
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
   * **Embedded Mode Strategy**: PASSIVE initialization
   * - Initialize MSAL instance only
   * - Do NOT attempt any authentication
   * - Wait for Shell to publish auth:signed-in event via BroadcastChannel
   * - UnifiedAuthProvider's event handler will perform SSO when event is received
   *
   * This approach avoids iframe sandboxing issues and ensures proper auth flow.
   */
  private async initializeRemoteEmbedded(): Promise<void> {
    const { msalInstance, appName, debug } = this.config;

    try {
      // Only initialize MSAL, don't authenticate
      await msalInstance.initialize();
      await msalInstance.handleRedirectPromise();

      if (!this.isMounted) return;

      if (debug) {
        console.info(
          `[${appName}] Embedded mode initialized. Waiting for Shell authentication event...`,
        );
      }

      // Check if we already have an account from a previous session
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        const account = accounts[0];
        if (account) {
          msalInstance.setActiveAccount(account);
          if (debug) {
            console.info(
              `[${appName}] Found existing account:`,
              account.username,
            );
          }

          // Proactively acquire tokens for this remote app's scopes
          // This handles the case where Shell already authenticated before remote loaded
          try {
            const { getAuthConfig } = this.config;
            await msalInstance.acquireTokenSilent({
              scopes: getAuthConfig().scopes,
              account,
            });

            if (debug) {
              console.info(
                `[${appName}] Successfully acquired tokens for existing account`,
              );
            }
          } catch (error) {
            // If token acquisition fails, we'll rely on the event handler
            // when Shell re-publishes or when user interacts
            if (debug) {
              console.warn(
                `[${appName}] Failed to acquire tokens during init, will retry on auth event:`,
                error,
              );
            }
          }
        }
      }

      // Authentication will also be triggered by:
      // 1. Shell publishing auth:signed-in event (for initial sign-in)
      // 2. UnifiedAuthProvider's event subscription handler
      // 3. That handler will call ssoSilent with loginHint from Shell
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

    console.info(`[${appName}] 🚀 Starting standalone mode initialization...`);

    try {
      console.info(`[${appName}] Initializing MSAL instance...`);
      await msalInstance.initialize();

      console.info(`[${appName}] Handling redirect promise...`);
      const response = await msalInstance.handleRedirectPromise();

      if (!this.isMounted) {
        console.warn(
          `[${appName}] Component unmounted, aborting initialization`,
        );
        return;
      }

      // Check if returning from OAuth redirect
      if (response) {
        console.info(
          `[${appName}] ✅ Standalone login successful:`,
          response.account.username,
        );
        msalInstance.setActiveAccount(response.account);

        const loginHint = getLoginHint(response.account);
        const accountId = response.account.homeAccountId;

        publishAuthEvent("auth:signed-in", {
          loginHint,
          accountId,
          appName,
          clientId: getAuthConfig().clientId,
        });

        // Handle return URL redirect after successful authentication
        const returnUrl = getAndClearReturnUrl();
        if (returnUrl) {
          if (debug) {
            console.info(`[${appName}] Redirecting to returnUrl:`, returnUrl);
          }
          safeRedirect(returnUrl, "/");
        } else {
          if (debug) {
            console.info(
              `[${appName}] No returnUrl found, staying on current page`,
            );
          }
        }
        return;
      }

      console.info(
        `[${appName}] No redirect response, checking for existing accounts...`,
      );

      // Try SSO silent authentication
      const accounts = msalInstance.getAllAccounts();
      console.info(`[${appName}] Found ${accounts.length} account(s) in cache`);

      if (accounts.length > 0) {
        const account = accounts[0];
        if (!account) return; // Type guard

        console.info(`[${appName}] Setting active account:`, account.username);
        msalInstance.setActiveAccount(account);

        console.info(`[${appName}] Attempting to acquire token silently...`);
        try {
          await msalInstance.acquireTokenSilent({
            scopes: getAuthConfig().scopes,
            account,
          });

          console.info(`[${appName}] ✅ Standalone token acquired silently`);
          return;
        } catch (_error: unknown) {
          console.warn(`[${appName}] Token acquisition failed, trying SSO...`);
          // Token refresh failed, try SSO
          try {
            const ssoResult = await msalInstance.ssoSilent({
              scopes: getAuthConfig().scopes,
              loginHint: account.username,
            });
            msalInstance.setActiveAccount(ssoResult.account);

            console.info(`[${appName}] ✅ Standalone SSO successful`);
            return;
          } catch (_ssoError) {
            console.warn(
              `[${appName}] SSO failed, will trigger interactive login`,
            );
            // Fall through to interactive login
          }
        }
      } else {
        console.info(`[${appName}] No cached accounts found`);
      }

      // No existing session or SSO failed - trigger interactive login
      // Check if interaction is already in progress (prevents duplicate redirects in React Strict Mode)
      const inProgress =
        msalInstance.getActiveAccount() === null &&
        window.sessionStorage.getItem("msal.interaction.status") !== null;

      if (inProgress) {
        console.warn(
          `[${appName}] Interaction already in progress, skipping loginRedirect()`,
        );
        return;
      }

      console.info(
        `[${appName}] 🔐 Triggering interactive login redirect to Azure AD...`,
      );
      console.info(`[${appName}] Redirect URI:`, getAuthConfig().redirectUri);
      console.info(`[${appName}] Scopes:`, getAuthConfig().scopes);

      await msalInstance.loginRedirect({
        scopes: getAuthConfig().scopes,
        prompt: "select_account",
      });

      console.info(`[${appName}] loginRedirect() called successfully`);
    } catch (error) {
      console.error(`[${appName}] ❌ Standalone initialization failed:`, error);
      const processed = AuthErrorHandler.process(
        error,
        `${appName} initialization`,
      );
      AuthErrorHandler.show(processed);
      throw error;
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
