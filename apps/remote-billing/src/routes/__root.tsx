import { createRootRoute, Outlet } from '@tanstack/react-router';
import { createRouteGuard } from '@one-portal/auth/utils';
import { msalInstance } from '../auth/msalInstance';

/**
 * Root route for Billing Remote App
 * Protected with authentication - all routes require sign-in
 * Unauthenticated users are redirected to Shell sign-in with returnUrl
 * Requirements: US2 (Protected Routes)
 */
export const Route = createRootRoute({
  // All Billing routes require authentication
  beforeLoad: createRouteGuard({
    msalInstance,
    scopes: ['openid', 'profile', 'email'],
    onUnauthenticated: (returnUrl) => {
      // Redirect to Shell sign-in with returnUrl to Billing route
      const shellSignInUrl = `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`;
      window.location.href = shellSignInUrl;
    },
    onAuthError: (error) => {
      console.error('Billing route guard auth error:', error);
    },
  }),
  
  component: () => <Outlet />,
});
