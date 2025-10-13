// packages/auth/src/contexts/AuthContext.tsx
// React Context for authentication state

import { createContext, useContext } from 'react';
import type { AuthState, UseAuthReturn } from '../types/auth';

/**
 * Default auth state for uninitialized context
 */
export const defaultAuthState: AuthState = {
  isInitialized: false,
  isAuthenticated: false,
  isLoading: true,
  account: null,
  userProfile: null,
  error: null,
};

/**
 * Auth context type - state + methods
 */
export type AuthContextValue = UseAuthReturn;

/**
 * Auth Context - provides auth state and methods to components
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

AuthContext.displayName = 'AuthContext';

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 * @returns Auth context value with state and methods
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Make sure your component is wrapped with <AuthProvider>.'
    );
  }
  
  return context;
}

/**
 * Hook to access only auth state (no methods)
 * Useful for components that only need to read state
 * @returns Current auth state
 * @throws Error if used outside AuthProvider
 */
export function useAuthState(): AuthState {
  const { state } = useAuth();
  return state;
}

/**
 * Hook to check if user is authenticated
 * Convenience hook for simple auth checks
 * @returns True if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { state } = useAuth();
  return state.isAuthenticated;
}
