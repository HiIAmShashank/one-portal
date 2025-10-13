import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';

/**
 * Billing Remote Application
 * This is the main component exposed via Module Federation
 * 
 * Uses TanStack Router for client-side routing within the Billing app
 * Routes are relative to the app's mount point (/apps/billing)
 * 
 * Requirements: FR-003 (Remote App Loading), US2 (Protected Routes)
 */

// Create QueryClient instance for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Create the router instance
const router = createRouter({
  routeTree,
  context: undefined!,
  // basepath must match where Shell mounts this remote app
  basepath: '/apps/billing',
});

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
