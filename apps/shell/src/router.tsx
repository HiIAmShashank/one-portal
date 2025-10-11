import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

/**
 * TanStack Router instance
 * Configured with file-based routing
 */
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Type augmentation for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
