import { createRoot } from 'react-dom/client';
import { ReportsMSALProvider } from './auth/MSALProvider';
import App from './App';

// CSS is provided by the shell in production
// Import conditionally for standalone dev/preview mode
if (import.meta.env.DEV || import.meta.env.MODE === 'preview') {
  await import('@one-portal/ui/styles.css');
}

createRoot(document.getElementById('app')!).render(
  <ReportsMSALProvider>
    <App />
  </ReportsMSALProvider>
);

