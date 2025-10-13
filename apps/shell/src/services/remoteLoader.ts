import type { Root } from 'react-dom/client';

/**
 * Remote Loader Service
 * 
 * Manages the lifecycle of dynamically loaded remote applications
 * via Module Federation. Handles loading, mounting, unmounting,
 * and cleanup of remote apps.
 * 
 * Requirements: FR-003, FR-005, PF-005, PF-006
 */

/**
 * Metadata for a loaded remote application
 */
export interface RemoteMetadata {
  /** Unique scope identifier for the remote */
  scope: string;
  /** The loaded module (remoteEntry exports) */
  module: any;
  /** Mount function from the remote bootstrap */
  mountFn?: (containerId: string) => Root | Promise<Root>;
  /** Unmount function from the remote bootstrap */
  unmountFn?: (instance: Root) => void;
  /** Currently mounted React root instance */
  instance?: Root;
  /** Container ID where the remote is mounted */
  containerId?: string;
  /** Timestamp when the remote was loaded */
  loadedAt?: number;
}

/**
 * Registry of loaded remote applications
 * Key: scope name (e.g., 'billing', 'reports')
 * Value: RemoteMetadata
 */
const remoteRegistry = new Map<string, RemoteMetadata>();

/**
 * Load a remote application module
 * 
 * This function dynamically imports the remote entry file and caches
 * it in the registry. If already loaded, returns cached version.
 * 
 * @param remoteEntryUrl - URL to the remoteEntry.js file
 * @param scope - Unique identifier for the remote (e.g., 'billing')
 * @returns Promise<RemoteMetadata> - Metadata for the loaded remote
 * 
 * @example
 * const remote = await loadRemote('/billing/assets/remoteEntry.js', 'billing');
 * const bootstrap = await remote.module.get('./bootstrap');
 */
export async function loadRemote(
  remoteEntryUrl: string,
  scope: string
): Promise<RemoteMetadata> {
  // Check if already loaded and cached
  if (remoteRegistry.has(scope)) {
    return remoteRegistry.get(scope)!;
  }

  try {
    // Dynamic import of the remote entry
    // @vite-ignore tells Vite to not analyze this import at build time
    const module = await import(/* @vite-ignore */ remoteEntryUrl);

    // Create metadata entry
    const metadata: RemoteMetadata = {
      scope,
      module,
      loadedAt: Date.now(),
    };

    // Try to load the bootstrap module which has mount/unmount
    try {
      const bootstrap = await module.get('./bootstrap');
      const bootstrapModule = bootstrap();
      
      metadata.mountFn = bootstrapModule.mount;
      metadata.unmountFn = bootstrapModule.unmount;
    } catch (error) {
      console.error(`[RemoteLoader] Bootstrap load failed for ${scope}:`, error);
      
      // Fallback: if no bootstrap, try to get the App directly
      const app = await module.get('./App');
      metadata.module = app;
    }

    // Cache in registry
    remoteRegistry.set(scope, metadata);
    
    return metadata;

  } catch (error) {
    console.error(`[RemoteLoader] ✗ Failed to load remote: ${scope}`, error);
    throw new Error(`Failed to load remote application "${scope}" from ${remoteEntryUrl}: ${error}`);
  }
}

/**
 * Mount a remote application into a container
 * 
 * @param scope - The scope of the remote to mount
 * @param containerId - DOM element ID to mount into
 * @returns Promise<Root> - The mounted React root instance
 * 
 * @throws Error if remote not loaded or mount fails
 * 
 * @example
 * await loadRemote('/billing/assets/remoteEntry.js', 'billing');
 * const instance = await mountRemote('billing', 'app-container');
 */
export async function mountRemote(
  scope: string,
  containerId: string
): Promise<Root> {
  const metadata = remoteRegistry.get(scope);
  
  if (!metadata) {
    throw new Error(`Remote "${scope}" not loaded. Call loadRemote() first.`);
  }

  if (!metadata.mountFn) {
    throw new Error(`Remote "${scope}" does not expose a mount function.`);
  }

  try {
    // Call the remote's mount function (may be async)
    const instance = await metadata.mountFn(containerId);
    
    // Update metadata with instance and container
    metadata.instance = instance;
    metadata.containerId = containerId;
    
    return instance;

  } catch (error) {
    console.error(`[RemoteLoader] Mount failed for ${scope}:`, error);
    throw new Error(`Failed to mount remote "${scope}": ${error}`);
  }
}

/**
 * Unmount a remote application and cleanup
 * 
 * @param scope - The scope of the remote to unmount
 * 
 * @example
 * unmountRemote('billing');
 */
export function unmountRemote(scope: string): void {
  const metadata = remoteRegistry.get(scope);
  
  if (!metadata || !metadata.instance) {
    return;
  }

  try {
    // Call the remote's unmount function if available
    if (metadata.unmountFn) {
      metadata.unmountFn(metadata.instance);
    }

    // Clear instance and container references
    metadata.instance = undefined;
    metadata.containerId = undefined;

  } catch (error) {
    console.error(`[RemoteLoader] Unmount failed for ${scope}:`, error);
    // Continue cleanup even if unmount fails
    metadata.instance = undefined;
    metadata.containerId = undefined;
  }
}

/**
 * Check if a remote is currently mounted
 * 
 * @param scope - The scope to check
 * @returns boolean - True if remote is mounted
 */
export function isRemoteMounted(scope: string): boolean {
  const metadata = remoteRegistry.get(scope);
  return !!metadata?.instance;
}

/**
 * Get metadata for a loaded remote
 * 
 * @param scope - The scope to get metadata for
 * @returns RemoteMetadata | undefined
 */
export function getRemoteMetadata(scope: string): RemoteMetadata | undefined {
  return remoteRegistry.get(scope);
}

/**
 * Clear all loaded remotes from registry
 * Unmounts any mounted remotes first
 * 
 * USE WITH CAUTION: This will unmount all remotes
 */
export function clearRemoteRegistry(): void {
  // Unmount all mounted remotes
  remoteRegistry.forEach((metadata, scope) => {
    if (metadata.instance) {
      unmountRemote(scope);
    }
  });

  // Clear the registry
  remoteRegistry.clear();
}

/**
 * Get all loaded remote scopes
 * 
 * @returns string[] - Array of scope names
 */
export function getLoadedRemotes(): string[] {
  return Array.from(remoteRegistry.keys());
}

/**
 * Load and mount a remote in one operation
 * 
 * Convenience function that combines loadRemote and mountRemote
 * 
 * @param remoteEntryUrl - URL to the remoteEntry.js
 * @param scope - Unique identifier for the remote
 * @param containerId - DOM element ID to mount into
 * @returns Promise<Root> - The mounted React root instance
 * 
 * @example
 * const instance = await loadAndMountRemote(
 *   '/billing/assets/remoteEntry.js',
 *   'billing',
 *   'app-container'
 * );
 */
export async function loadAndMountRemote(
  remoteEntryUrl: string,
  scope: string,
  containerId: string
): Promise<Root> {
  // Load if not already loaded
  await loadRemote(remoteEntryUrl, scope);
  
  // Mount the remote
  return mountRemote(scope, containerId);
}
