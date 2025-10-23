import { createRootRoute, Outlet } from '@tanstack/react-router';
import { createProtectedRouteGuard } from '@one-portal/auth/guards';
import { safeRedirect } from '@one-portal/auth/utils';
import { msalInstance } from '../auth/msalInstance';
import { AppLayout } from '../components/AppLayout';

export const Route = createRootRoute({
  beforeLoad: async ({ location, preload }) => {
    const isEmbeddedInShell = window.location.pathname.startsWith('/apps/');

    if (!isEmbeddedInShell) {
      console.log('[Domino] Standalone mode detected, skipping route guard');
      return;
    }

    // Use preset guard with skipRedirectOnPreload for lazy-loaded routes
    const guard = createProtectedRouteGuard(msalInstance, {
      skipRedirectOnPreload: true,
      onUnauthenticated: (returnUrl) => {
        // Redirect to Shell sign-in with returnUrl to Domino route
        const shellSignInUrl = `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`;
        safeRedirect(shellSignInUrl, '/sign-in');
      },
      onAuthError: (error) => {
        console.error('[Domino] Route guard auth error:', error);
      },
    });

    await guard({ location, preload });
  },

  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});
