import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '../components/Header';
import { ThemeProvider } from '../components/ThemeProvider';
import { createRouteGuard } from '@one-portal/auth/utils';
import { msalInstance } from '../auth/msalInstance';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/sign-in', '/auth/callback'];

/**
 * Root route for TanStack Router
 * Provides the persistent shell layout wrapper for all child routes
 * Requirements: FR-004, FR-006, US2 (Protected Routes)
 */
export const Route = createRootRoute({
  // Protected routes - check authentication before rendering
  // Public routes: /sign-in, /auth/callback
  // All other routes (including /) require authentication
  beforeLoad: async ({ location }) => {
    const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
    
    // Skip auth check for public routes
    if (isPublicRoute) {
      return;
    }
    
    // For protected routes, use the route guard
    const guard = createRouteGuard({
      msalInstance,
      scopes: ['openid', 'profile', 'email'],
      onUnauthenticated: (returnUrl) => {
        // Redirect to sign-in with returnUrl
        window.location.href = `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`;
      },
      onAuthError: (error) => {
        console.error('Route guard auth error:', error);
      },
    });
    
    await guard({ location });
  },
  
  component: () => {
    // TODO: Get apps from useShellConfig hook (will be implemented next)
    const mockApps = [
      {
        id: 'billing',
        name: 'Billing',
        remoteEntryUrl: '/billing/assets/remoteEntry.js',
        moduleName: 'billing',
        scope: 'billing',
        displayOrder: 1,
      },
      {
        id: 'reports',
        name: 'Reports',
        remoteEntryUrl: '/reports/assets/remoteEntry.js',
        moduleName: 'reports',
        scope: 'reports',
        displayOrder: 2,
      },  

    ];

    return (
      <ThemeProvider defaultTheme="system" storageKey="one-portal-ui-theme">
        <div className="flex min-h-screen flex-col bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
          <Header apps={mockApps} />
          <main className="flex-1 grow min-h-[calc(100vh-63px)] overflow-hidden">
            {/* This is where child routes will render */}
            <Outlet />
          </main>
        </div>
      </ThemeProvider>
    );
  },
});
