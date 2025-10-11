import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Bootstrap file for Billing Remote App
 * 
 * This file serves as the Module Federation entry point.
 * It exports mount and unmount functions that allow the shell
 * to dynamically load and manage this remote application.
 * 
 * Requirements: FR-003, FR-005
 */

/**
 * Mount the billing app into a specified container
 * 
 * @param containerId - The ID of the DOM element to mount into
 * @returns Root instance for cleanup
 * 
 * @example
 * const root = mount('billing-container');
 */
export function mount(containerId: string): Root {
  const container = document.getElementById(containerId);
  
  if (!container) {
    throw new Error(`[Billing] Container element with ID "${containerId}" not found`);
  }

  console.log(`[Billing] Mounting into container: ${containerId}`);
  
  const root = createRoot(container);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  return root;
}

/**
 * Unmount the billing app and cleanup resources
 * 
 * @param root - The Root instance returned from mount()
 * 
 * @example
 * unmount(root);
 */
export function unmount(root: Root): void {
  console.log('[Billing] Unmounting application');
  root.unmount();
}

/**
 * Development-only: Auto-mount if running standalone
 * This allows the app to work independently during development
 */
if (process.env.NODE_ENV === 'development' && !window.__BILLING_REMOTE_LOADED__) {
  // Mark as loaded to prevent double-mounting
  window.__BILLING_REMOTE_LOADED__ = true;
  
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
    __BILLING_REMOTE_LOADED__?: boolean;
  }
}
