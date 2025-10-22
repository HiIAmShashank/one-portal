import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

if (import.meta.env.DEV || import.meta.env.MODE === 'preview') {
  await import('@one-portal/ui/styles.css');
}
createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
