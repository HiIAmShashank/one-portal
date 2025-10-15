import { createRoot } from 'react-dom/client';
import { ReportsMSALProvider } from './auth/MSALProvider';
import App from './App';

createRoot(document.getElementById('app')!).render(
  <ReportsMSALProvider>
    <App />
  </ReportsMSALProvider>
);

