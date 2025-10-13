import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

/**
 * TanStack Router instance
 * Configured with file-based routing
 * Preloading disabled to prevent auth issues on hover
 */
export const router = createRouter({
  routeTree,
  defaultPreload: false, // Disable preloading to avoid triggering auth checks on hover
});

// Type augmentation for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
