import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';

/**
 * Standalone entry point for local development
 * This file is only used when running `pnpm dev` in this app's directory
 */
createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
