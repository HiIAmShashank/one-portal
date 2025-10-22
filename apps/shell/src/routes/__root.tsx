import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '../components/Header';
import { ThemeProvider } from '../components/ThemeProvider';
import { createRouteGuard } from '@one-portal/auth/utils';
import { msalInstance } from '../auth/msalInstance';

const PUBLIC_ROUTES = ['/sign-in', '/auth/callback'];

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
    if (isPublicRoute) {
      return;
    }
    const guard = createRouteGuard({
      msalInstance,
      scopes: ['openid', 'profile', 'email'],
      onUnauthenticated: (returnUrl) => {
        window.location.href = `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`;
      },
      onAuthError: (error) => {
        console.error('Route guard auth error:', error);
      },
    });

    await guard({ location });
  },

  component: () => {
    const mockApps = [
      {
        id: 'billing',
        name: 'Billing',
        remoteEntryUrl: '/billing/assets/remoteEntry.js',
        moduleName: 'billing',
        scope: 'billing',
        displayOrder: 1,
      }, {
        id: 'domino',
        name: 'Domino',
        remoteEntryUrl: '/domino/assets/remoteEntry.js',
        moduleName: 'domino',
        scope: 'domino',
        displayOrder: 2,
      },

    ];

    return (
      <ThemeProvider defaultTheme="system" storageKey="one-portal-ui-theme">
        <div className="flex min-h-screen flex-col bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
          <Header apps={mockApps} />
          <main className="flex-1 grow min-h-[calc(100vh-70px)] overflow-hidden">
            {/* This is where child routes will render */}
            <Outlet />
          </main>
        </div>
      </ThemeProvider>
    );
  },
});
