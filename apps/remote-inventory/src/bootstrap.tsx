import type { MountFunction, UnmountFunction } from '@one-portal/types';
import { createRoot, type Root } from 'react-dom/client';
import App from './App';
import './style.css';

let root: Root | null = null;

/**
 * Mount function - called by the shell when this remote app should be displayed
 * @param containerId - The ID of the DOM element where the app should be mounted
 * @returns Root instance for cleanup
 * 
 * Requirements: FR-003 (Remote Application Integration)
 */
export const mount: MountFunction = (containerId: string) => {
  const container = document.getElementById(containerId);
  
  if (!container) {
    throw new Error(`[Inventory Management] Container element with ID "${containerId}" not found`);
  }

  console.log(`[Inventory Management] Mounting into container: ${containerId}`);
  
  if (!root) {
    root = createRoot(container);
  }
  
  root.render(<App />);
  
  return root;
};

/**
 * Unmount function - called by the shell when switching away from this app
 * 
 * Requirements: FR-003 (Remote Application Integration)
 */
export const unmount: UnmountFunction = () => {
  console.log('[Inventory Management] Unmounting application');
  
  if (root) {
    root.unmount();
    root = null;
  }
};
