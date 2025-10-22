import { createRootRoute, Outlet } from '@tanstack/react-router';
import { createRouteGuard } from '@one-portal/auth/utils';
import { msalInstance } from '../auth/msalInstance';

export const Route = createRootRoute({
  // All Domino routes require authentication
  // NOTE: Only enforce in production/Shell context to avoid infinite loops in standalone dev
  beforeLoad: createRouteGuard({
    msalInstance,
    scopes: ['openid', 'profile', 'email'],
    onUnauthenticated: (returnUrl) => {
      // Check if running standalone (dev mode at localhost:5173)
      const isStandalone = window.location.port === '5173' && import.meta.env.DEV;

      if (isStandalone) {
        // In standalone mode, don't redirect - let MSALProvider handle auth
        console.log('[Domino] Route guard: Standalone mode, skipping redirect');
        return;
      }

      // In Shell context, redirect to Shell sign-in with returnUrl to Domino route
      const shellSignInUrl = `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`;
      window.location.href = shellSignInUrl;
    },
    onAuthError: (error) => {
      console.error('[Domino] Route guard auth error:', error);
    },
  }),

  component: () => <Outlet />,
});
