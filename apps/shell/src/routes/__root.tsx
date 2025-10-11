import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '../components/Header';
import { TopNavigation } from '../components/TopNavigation';
import { ThemeProvider } from '../components/ThemeProvider';

/**
 * Root route for TanStack Router
 * Provides the persistent shell layout wrapper for all child routes
 * Requirements: FR-004, FR-006
 */
export const Route = createRootRoute({
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
        <div className="min-h-screen bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
          <Header />
          <TopNavigation apps={mockApps} />
          <main className="container mx-auto">
            {/* This is where child routes will render */}
            <Outlet />
          </main>
        </div>
      </ThemeProvider>
    );
  },
});
