import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ReportsMSALProvider } from './auth/MSALProvider';
import App from './App';

/**
 * Bootstrap file for Reports Remote App
 * 
 * This file serves as the Module Federation entry point.
 * It exports mount and unmount functions that allow the shell
 * to dynamically load and manage this remote application.
 * 
 * Requirements: FR-003, FR-005
 */

/**
 * Mount the reports app into a specified container
 * 
 * @param containerId - The ID of the DOM element to mount into
 * @returns Root instance for cleanup
 * 
 * @example
 * const root = mount('reports-container');
 */
export async function mount(containerId: string): Promise<Root> {
  const container = document.getElementById(containerId);
  
  if (!container) {
    throw new Error(`[Reports] Container element with ID "${containerId}" not found`);
  }
  
  const root = createRoot(container);
  
  root.render(
    <StrictMode>
      <ReportsMSALProvider>
        <App />
      </ReportsMSALProvider>
    </StrictMode>
  );

  return root;
}

/**
 * Unmount the reports app and cleanup resources
 * 
 * @param root - The Root instance returned from mount()
 * 
 * @example
 * unmount(root);
 */
export function unmount(root: Root): void {
  root.unmount();
}

/**
 * Development-only: Auto-mount if running standalone
 * This allows the app to work independently during development
 */
if (process.env.NODE_ENV === 'development' && !window.__REPORTS_REMOTE_LOADED__) {
  // Mark as loaded to prevent double-mounting
  window.__REPORTS_REMOTE_LOADED__ = true;
  
  // Create a root container if it doesn't exist
  let container = document.getElementById('root');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  }

  mount('root');
}

// Type augmentation for global flag
declare global {
  interface Window {
    __REPORTS_REMOTE_LOADED__?: boolean;
  }
}
