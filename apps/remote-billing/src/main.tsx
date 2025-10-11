import { createRoot } from 'react-dom/client';
import App from './App';
// CSS is provided by the shell - no need to import here

createRoot(document.getElementById('app')!).render(<App />);
