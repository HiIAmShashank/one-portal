import { createFileRoute } from '@tanstack/react-router';
import { RemoteMount } from '../components/RemoteMount';

export const Route = createFileRoute('/apps/$appId')({
  component: AppComponent,
});

function AppComponent() {
  const { appId } = Route.useParams();

  const mockApps = [{
    id: 'domino',
    name: 'Domino',
    remoteEntryUrl: '/domino/assets/remoteEntry.js',
    moduleName: 'domino',
    scope: 'domino',
    displayOrder: 1,
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
