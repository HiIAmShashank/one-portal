import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UnifiedAuthProvider } from '@one-portal/auth/providers';
import { msalInstance, getAuthConfig } from './auth/msalInstance';
import App from './App';
import './style.css';
import './styles/sidebar-overrides.css';

if (import.meta.env.DEV || import.meta.env.MODE === 'preview') {
  await import('@one-portal/ui/styles.css');
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <UnifiedAuthProvider
      msalInstance={msalInstance}
      getAuthConfig={getAuthConfig}
      mode="remote"
      appName="domino"
      debug={import.meta.env.DEV}
    >
      <App />
    </UnifiedAuthProvider>
  </StrictMode>
);
