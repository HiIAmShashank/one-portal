// packages/auth/src/types/auth.ts
// Shared TypeScript types for authentication across OnePortal apps

import type { AccountInfo } from '@azure/msal-browser';

/**
 * Environment configuration for MSAL per app
 * Loaded from VITE_AUTH_* environment variables
 */
export interface AuthConfig {
  /** Azure AD application (client) ID - unique per app */
  clientId: string;
  
  /** Azure AD tenant authority URL */
  authority: string;
  
  /** Post-authentication redirect URI */
  redirectUri: string;
  
  /** Post-sign-out redirect URI */
  postLogoutRedirectUri?: string;
  
  /** Default scopes for this app (e.g., ['User.Read']) */
  scopes: string[];
  
  /** App name for telemetry and logging */
  appName: string;
}

/**
 * User profile information extracted from ID token claims
 * Consistent shape across all apps for UI rendering
 */
export interface UserProfile {
  /** Unique account identifier (homeAccountId) */
  id: string;
  
  /** User principal name / email */
  email: string;
  
  /** Display name */
  name: string;
  
  /** Optional roles from ID token claims */
  roles?: string[];
  
  /** Optional groups from ID token claims */
  groups?: string[];
  
  /** Tenant ID */
  tenantId: string;
}

/**
 * Authentication state exposed via React context/hooks
 * Consistent interface across Shell and Remotes
 */
export interface AuthState {
  /** Whether auth initialization is complete */
  isInitialized: boolean;
  
  /** Whether user is authenticated (has valid tokens) */
  isAuthenticated: boolean;
  
  /** Whether an auth operation is in progress */
  isLoading: boolean;
  
  /** Active account information from MSAL */
  account: AccountInfo | null;
  
  /** Simplified user profile for UI display */
  userProfile: UserProfile | null;
  
  /** Last authentication error, if any */
  error: AuthError | null;
}

/**
 * Authentication error with categorization
 * Used for user-facing error messages and retry logic
 */
export interface AuthError {
  /** MSAL error code */
  code: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Optional detailed sub-error */
  subError?: string;
  
  /** Whether error is user-actionable vs system error */
  isActionable: boolean;
  
  /** Suggested retry action (if applicable) */
  retryAction?: 'login' | 'refresh' | 'contact-admin';
  
  /** When error occurred */
  timestamp: Date;
}

/**
 * Auth hook return type
 * Consistent interface for useAuth() across all apps
 */
export interface UseAuthReturn {
  /** Current auth state */
  state: AuthState;
  
  /** Trigger interactive login (Shell only - Remotes redirect to Shell) */
  login: () => Promise<void>;
  
  /** Sign out user and clear tokens */
  logout: () => Promise<void>;
  
  /** Acquire access token silently for given scopes */
  acquireToken: (scopes: string[]) => Promise<string | null>;
  
  /** Check if user has required role(s) */
  hasRole: (roles: string | string[]) => boolean;
  
  /** Clear last error */
  clearError: () => void;
}

/**
 * Token acquisition options for API calls
 */
export interface TokenRequest {
  /** Required permission scopes */
  scopes: string[];
  
  /** Force token refresh (ignore cache) */
  forceRefresh?: boolean;
  
  /** Specific account to acquire token for (multi-account scenarios) */
  account?: AccountInfo;
  
  /** Additional claims to request */
  claims?: string;
}

/**
 * Route guard configuration for protected routes
 */
export interface RouteGuardConfig {
  /** Whether route requires authentication */
  requiresAuth: boolean;
  
  /** Required roles to access route (all must match) */
  requiredRoles?: string[];
  
  /** Required scopes for route (used for token acquisition) */
  requiredScopes?: string[];
  
  /** Where to redirect if auth check fails */
  redirectTo?: string;
  
  /** Custom authorization check function (optional) */
  authorize?: (account: AccountInfo) => boolean | Promise<boolean>;
}

/**
 * Auth telemetry event for logging/monitoring
 */
export interface AuthTelemetryEvent {
  /** Event type */
  type: 'login' | 'logout' | 'token-acquired' | 'token-refresh' | 'error' | 'silent-sso';
  
  /** App that generated event */
  appName: string;
  
  /** Client ID related to event */
  clientId: string;
  
  /** Success/failure */
  success: boolean;
  
  /** Operation duration in milliseconds */
  durationMs?: number;
  
  /** Error details if failed */
  error?: Pick<AuthError, 'code' | 'message'>;
  
  /** Timestamp */
  timestamp: Date;
  
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * MSAL interaction type for tracking in-progress operations
 */
export type MsalInteractionType = 'redirect' | 'popup' | 'silent' | 'none';

/**
 * Auth context provider props
 */
export interface AuthProviderProps {
  /** App-specific MSAL configuration */
  config: AuthConfig;
  
  /** Child components */
  children: React.ReactNode;
  
  /** Optional telemetry callback */
  onTelemetry?: (event: AuthTelemetryEvent) => void;
}

/**
 * Type guard for MSAL errors
 */
export function isMsalError(error: unknown): error is { errorCode: string; errorMessage: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errorCode' in error &&
    'errorMessage' in error
  );
}

/**
 * Type guard for interaction required errors
 */
export function isInteractionRequiredError(error: unknown): boolean {
  if (!isMsalError(error)) return false;
  return ['interaction_required', 'consent_required', 'login_required'].includes(error.errorCode);
}
