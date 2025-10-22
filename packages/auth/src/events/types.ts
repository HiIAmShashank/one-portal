export type AuthEventType =
  | 'auth:signed-in'
  | 'auth:signed-out'
  | 'auth:token-acquired'
  | 'auth:account-changed'
  | 'auth:error';

export interface AuthError {
  code: string;
  message: string;
  subError?: string;
  timestamp: number;
  appName: string;
}

/**
 * Auth event published via BroadcastChannel to notify other apps
 */
export interface AuthEvent {
  type: AuthEventType;
  timestamp: number;
  payload?: {
    loginHint?: string;
    accountId?: string;
    error?: AuthError;
    appName?: string;
    clientId?: string;
  };
}

export function isAuthEvent(event: unknown): event is AuthEvent {
  if (typeof event !== 'object' || event === null) return false;

  const e = event as Partial<AuthEvent>;
  return (
    typeof e.type === 'string' &&
    typeof e.timestamp === 'number' &&
    ['auth:signed-in', 'auth:signed-out', 'auth:token-acquired', 'auth:account-changed', 'auth:error'].includes(e.type)
  );
}

export type AuthEventHandler = (event: AuthEvent) => void | Promise<void>;

export type UnsubscribeFn = () => void;
