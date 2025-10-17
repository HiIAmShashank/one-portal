import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// CSS is provided by the shell in production
// Import conditionally for standalone dev/preview mode
if (import.meta.env.DEV || import.meta.env.MODE === 'preview') {
  await import('@one-portal/ui/styles.css');
}

/**
 * Standalone entry point for local development
 * This file is only used when running `pnpm dev` in this app's directory
 */
createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
