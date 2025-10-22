import { createRootRoute, Outlet } from '@tanstack/react-router';
import { createRouteGuard } from '@one-portal/auth/utils';
import { msalInstance } from '../auth/msalInstance';

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const isEmbeddedInShell = window.location.pathname.startsWith('/apps/');

    if (!isEmbeddedInShell) {
      console.log('[Domino] Standalone mode detected, skipping route guard');
      return;
    }
    const guard = createRouteGuard({
      msalInstance,
      scopes: ['openid', 'profile', 'email'],
      onUnauthenticated: (returnUrl) => {
        // Redirect to Shell sign-in with returnUrl to Domino route
        const shellSignInUrl = `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`;
        window.location.href = shellSignInUrl;
      },
      onAuthError: (error) => {
        console.error('[Domino] Route guard auth error:', error);
      },
    });

    await guard({ location });
  },

  component: () => <Outlet />,
});
