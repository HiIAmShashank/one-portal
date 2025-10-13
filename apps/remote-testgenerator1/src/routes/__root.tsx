import { createRootRoute, Outlet } from '@tanstack/react-router';
import { createRouteGuard } from '@one-portal/auth/utils';
import { msalInstance } from '../auth/msalInstance';

/**
 * Root route for Test Gen 1
 * 
 * All routes are protected with authentication - unauthenticated users
 * are redirected to Shell sign-in with returnUrl
 * 
 * Requirements: US2 (Protected Routes), FR-005 (Authentication)
 */
export const Route = createRootRoute({
  // All Test Gen 1 routes require authentication
  beforeLoad: createRouteGuard({
    msalInstance,
    scopes: ['openid', 'profile', 'email'],
    onUnauthenticated: (returnUrl) => {
      // Redirect to Shell sign-in with returnUrl to Test Gen 1 route
      const shellSignInUrl = `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`;
      window.location.href = shellSignInUrl;
    },
    onAuthError: (error) => {
      console.error('[Test Gen 1] Route guard auth error:', error);
    },
  }),
  
  component: () => <Outlet />,
});
