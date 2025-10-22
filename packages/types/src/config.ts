export interface RemoteApp {
  id: string;
  name: string;
  remoteEntryUrl: string;
  moduleName: string;
  scope: string;
  icon?: string;
  order?: number;
  enabled?: boolean;
}

export interface ShellConfiguration {
  apps: RemoteApp[];
  branding: {
    title: string;
    logoUrl?: string;
  };
  defaults?: {
    theme?: 'light' | 'dark' | 'system';
    language?: 'en' | 'es' | 'fr' | 'de';
  };
}

/**
 * Internal metadata for tracking loaded remote applications
 */
export interface RemoteMetadata {
  app: RemoteApp;
  isLoaded: boolean;
  mount?: (containerId: string) => void | Promise<void>;
  unmount?: (containerId: string) => void | Promise<void>;
  loadedAt?: Date;
  error?: {
    message: string;
    timestamp: Date;
  };
}
