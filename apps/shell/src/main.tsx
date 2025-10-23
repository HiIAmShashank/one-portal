import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UnifiedAuthProvider } from '@one-portal/auth';
import { msalInstance, getAuthConfig } from './auth/msalInstance';
import { router } from './router';
import { Sonner } from '@one-portal/ui';
import './style.css';
import '@one-portal/ui/styles.css';
import { validateShellEnv } from '@one-portal/config/env';

try {
  validateShellEnv();
} catch (error) {
  console.error(error);
  document.body.innerHTML = `
    <div style="padding: 2rem; color: red;">
      <h1>Configuration Error</h1>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
  throw error;
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <UnifiedAuthProvider
      msalInstance={msalInstance}
      mode="host"
      appName="shell"
      getAuthConfig={getAuthConfig}
      debug={import.meta.env.DEV}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </UnifiedAuthProvider>
    <Sonner />
  </StrictMode>
);
