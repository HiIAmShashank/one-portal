import { createFileRoute } from '@tanstack/react-router';
import { RemoteMount } from '../components/RemoteMount';

/**
 * Dynamic route for remote applications
 * Path: /apps/$appId
 * 
 * This route loads and renders remote applications dynamically
 * using Module Federation based on the appId parameter
 * Requirements: FR-006, FR-003
 */
export const Route = createFileRoute('/apps/$appId')({
  component: AppComponent,
});

function AppComponent() {
  const { appId } = Route.useParams();

  // TODO: Get app config from useShellConfig hook and find by appId
  // For now, using mock data
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
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      remoteEntryUrl: '/analytics/assets/remoteEntry.js',
      moduleName: 'analytics',
      scope: 'analytics',
      displayOrder: 3,
    },    {
      id: 'inventory',
      name: 'Inventory Management',
      remoteEntryUrl: '/inventory/assets/remoteEntry.js',
      moduleName: 'inventory',
      scope: 'inventory',
      displayOrder: 4,
    },

  ];

  const app = mockApps.find((a) => a.id === appId);

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-2xl font-semibold">Application Not Found</h2>
        <p className="text-muted-foreground">
          The application "{appId}" could not be found.
        </p>
      </div>
    );
  }

  return <RemoteMount app={app} />;
}
