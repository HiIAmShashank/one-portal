import type { Root } from 'react-dom/client';

export interface RemoteMetadata {
  scope: string;
  module: any;
  mountFn?: (containerId: string) => Root | Promise<Root>;
  unmountFn?: (instance: Root) => void;
  instance?: Root;
  containerId?: string;
  loadedAt?: number;
}

const remoteRegistry = new Map<string, RemoteMetadata>();

export async function loadRemote(
  remoteEntryUrl: string,
  scope: string
): Promise<RemoteMetadata> {
  if (remoteRegistry.has(scope)) {
    return remoteRegistry.get(scope)!;
  }

  try {
    const module = await import(/* @vite-ignore */ remoteEntryUrl);

    const metadata: RemoteMetadata = {
      scope,
      module,
      loadedAt: Date.now(),
    };

    try {
      const bootstrap = await module.get('./bootstrap');
      const bootstrapModule = bootstrap();

      metadata.mountFn = bootstrapModule.mount;
      metadata.unmountFn = bootstrapModule.unmount;
    } catch (error) {
      console.error(`[RemoteLoader] Bootstrap load failed for ${scope}:`, error);

      const app = await module.get('./App');
      metadata.module = app;
    }

    remoteRegistry.set(scope, metadata);

    return metadata;

  } catch (error) {
    console.error(`[RemoteLoader] ✗ Failed to load remote: ${scope}`, error);
    throw new Error(`Failed to load remote application "${scope}" from ${remoteEntryUrl}: ${error}`);
  }
}

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
    const instance = await metadata.mountFn(containerId);

    metadata.instance = instance;
    metadata.containerId = containerId;

    return instance;

  } catch (error) {
    console.error(`[RemoteLoader] Mount failed for ${scope}:`, error);
    throw new Error(`Failed to mount remote "${scope}": ${error}`);
  }
}

export function unmountRemote(scope: string): void {
  const metadata = remoteRegistry.get(scope);

  if (!metadata || !metadata.instance) {
    return;
  }

  try {
    if (metadata.unmountFn) {
      metadata.unmountFn(metadata.instance);
    }

    metadata.instance = undefined;
    metadata.containerId = undefined;

  } catch (error) {
    console.error(`[RemoteLoader] Unmount failed for ${scope}:`, error);
    metadata.instance = undefined;
    metadata.containerId = undefined;
  }
}

export async function loadAndMountRemote(
  remoteEntryUrl: string,
  scope: string,
  containerId: string
): Promise<Root> {
  await loadRemote(remoteEntryUrl, scope);
  return mountRemote(scope, containerId);
}
