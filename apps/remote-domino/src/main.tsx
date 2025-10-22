import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DominoMSALProvider } from './auth/MSALProvider';
import { msalInstance } from './auth/msalInstance';
import App from './App';

if (import.meta.env.DEV || import.meta.env.MODE === 'preview') {
  await import('@one-portal/ui/styles.css');
}

await msalInstance.initialize();

const isEmbeddedInShell = window.location.pathname.startsWith('/apps/');
if (isEmbeddedInShell) {
  await msalInstance.handleRedirectPromise();
} else {
  console.log('[Domino] Standalone mode: Skipping redirect handling');
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <DominoMSALProvider>
      <App />
    </DominoMSALProvider>
  </StrictMode>
);
