// packages/auth/src/events/types.ts
// Auth Event Bus Type Definitions for Cross-App Communication

/**
 * Auth event types that can be published/subscribed across micro-frontends
 * via BroadcastChannel API
 */
export type AuthEventType =
  | 'auth:signed-in'      // User completed interactive login (Shell only)
  | 'auth:signed-out'     // User initiated sign-out (Shell or Remote)
  | 'auth:token-acquired' // Access token acquired (for telemetry)
  | 'auth:account-changed'// User switched accounts (multi-account scenario)
  | 'auth:error';         // Authentication error occurred

/**
 * Error details for failed auth operations
 */
export interface AuthError {
  /** MSAL error code (e.g., 'interaction_required', 'consent_required') */
  code: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Optional detailed sub-error code from Entra ID */
  subError?: string;
  
  /** Timestamp when error occurred */
  timestamp: number;
  
  /** Which app encountered the error */
  appName: string;
}

/**
 * Main auth event payload structure
 * Published via BroadcastChannel to notify other apps of auth state changes
 */
export interface AuthEvent {
  /** Type of authentication event */
  type: AuthEventType;
  
  /** Timestamp when event was published (ms since epoch) */
  timestamp: number;
  
  /** Optional event payload with context-specific data */
  payload?: {
    /**
     * Login hint (UPN/email) for silent SSO in Remotes
     * Only included in 'auth:signed-in' events
     */
    loginHint?: string;
    
    /**
     * Unique account identifier (homeAccountId format: {oid}.{tid})
     * Included in sign-in, sign-out, and account-changed events
     */
    accountId?: string;
    
    /**
     * Error details if operation failed
     * Only included in 'auth:error' events
     */
    error?: AuthError;
    
    /**
     * Which app published this event
     */
    appName?: string;
    
    /**
     * Client ID of the app that published event (for debugging)
     */
    clientId?: string;
  };
}

/**
 * Type guard to check if event is a valid AuthEvent
 */
export function isAuthEvent(event: unknown): event is AuthEvent {
  if (typeof event !== 'object' || event === null) return false;
  
  const e = event as Partial<AuthEvent>;
  return (
    typeof e.type === 'string' &&
    typeof e.timestamp === 'number' &&
    ['auth:signed-in', 'auth:signed-out', 'auth:token-acquired', 'auth:account-changed', 'auth:error'].includes(e.type)
  );
}

/**
 * Event handler function type for subscribers
 */
export type AuthEventHandler = (event: AuthEvent) => void | Promise<void>;

/**
 * Subscription cleanup function returned by subscribeToAuthEvents
 */
export type UnsubscribeFn = () => void;
