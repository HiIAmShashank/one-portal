import { createRoot } from 'react-dom/client';
import { ReportsMSALProvider } from './auth/MSALProvider';
import App from './App';
// CSS is provided by the shell - no need to import here

createRoot(document.getElementById('app')!).render(
  <ReportsMSALProvider>
    <App />
  </ReportsMSALProvider>
);

