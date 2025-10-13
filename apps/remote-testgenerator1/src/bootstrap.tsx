import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Testgenerator1MSALProvider } from './auth/MSALProvider';
import App from './App';
// CSS is provided by the shell - no need to import here

/**
 * Bootstrap file for Test Gen 1
 * 
 * Module Federation entry point that exports mount and unmount functions
 * for the shell to dynamically load and manage this remote application.
 * 
 * Requirements: FR-003 (Remote App Integration), FR-005 (Authentication)
 */

/**
 * Mount the testgenerator1 app into a specified container
 * 
 * @param containerId - The ID of the DOM element to mount into
 * @returns Root instance for cleanup
 * 
 * @example
 * const root = mount('testgenerator1-container');
 */
export async function mount(containerId: string): Promise<Root> {
  const container = document.getElementById(containerId);
  
  if (!container) {
    throw new Error(`[Test Gen 1] Container element with ID "${containerId}" not found`);
  }
  
  console.log(`[Test Gen 1] Mounting into container: ${containerId}`);
  
  const root = createRoot(container);
  
  root.render(
    <StrictMode>
      <Testgenerator1MSALProvider>
        <App />
      </Testgenerator1MSALProvider>
    </StrictMode>
  );

  return root;
}

/**
 * Unmount the testgenerator1 app and cleanup resources
 * 
 * @param root - The Root instance returned from mount()
 * 
 * @example
 * unmount(root);
 */
export function unmount(root: Root): void {
  console.log('[Test Gen 1] Unmounting application');
  root.unmount();
}

/**
 * Development-only: Auto-mount if running standalone
 * This allows the app to work independently during development
 */
if (process.env.NODE_ENV === 'development' && !window.__TESTGENERATOR1_REMOTE_LOADED__) {
  // Mark as loaded to prevent double-mounting
  window.__TESTGENERATOR1_REMOTE_LOADED__ = true;
  
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
    __TESTGENERATOR1_REMOTE_LOADED__?: boolean;
  }
}

