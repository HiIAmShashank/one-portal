// packages/auth/src/index.ts
// Main barrel export for @repo/auth package

// Types
export type * from './types';

// Event Bus
export * from './events';

// Configuration
export * from './config';

// React Context
export { AuthContext, useAuth, useAuthState, useIsAuthenticated, defaultAuthState } from './contexts/AuthContext';

// Utilities
export * from './utils';

// API Clients
export * from './api/GraphClient';

// Hooks (to be implemented)
// export { useAuthToken } from './hooks/useAuthToken';
// export { useProtectedRoute } from './hooks/useProtectedRoute';

// Contexts (providers to be implemented)
// export { AuthProvider } from './contexts/AuthProvider';
