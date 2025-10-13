import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShellMSALProvider } from './auth/MSALProvider';
import { initializeMsal } from './auth/msalInstance';
import { router } from './router';
import { Sonner } from '@one-portal/ui';
import './style.css';
import '@one-portal/ui/styles.css';

// Create Query Client for data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize MSAL before rendering
initializeMsal().then(() => {
  createRoot(document.getElementById('app')!).render(
    <StrictMode>
      <ShellMSALProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ShellMSALProvider>
      <Sonner />
    </StrictMode>
  );
}).catch(error => {
  console.error('[Shell] MSAL initialization failed:', error);
  // Render error state
  createRoot(document.getElementById('app')!).render(
    <div className="flex items-center justify-center ">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Authentication Error</h1>
        <p className="text-gray-600">Failed to initialize authentication. Please refresh the page.</p>
      </div>
    </div>
  );
});
