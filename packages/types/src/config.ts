/**
 * Configuration types for the OnePortal Shell application
 * Defines the structure for shell configuration and remote app metadata
 */

export interface RemoteApp {
  /**
   * Unique identifier for the remote application
   * @example "billing", "reports", "inventory"
   */
  id: string;

  /**
   * Display name shown in navigation
   * @example "Billing Management", "Reports Dashboard"
   */
  name: string;

  /**
   * URL to the remote entry file (Module Federation)
   * @example "http://localhost:5001/remoteEntry.js"
   */
  remoteEntryUrl: string;

  /**
   * Remote module name defined in Module Federation config
   * @example "billingApp", "reportsApp"
   */
  moduleName: string;

  /**
   * Scope name for the remote module
   * @example "billing", "reports"
   */
  scope: string;

  /**
   * Icon identifier for the navigation menu
   * @example "billing-icon", "reports-icon"
   */
  icon?: string;

  /**
   * Display order in navigation (lower = earlier)
   * @default 0
   */
  order?: number;

  /**
   * Whether the app is currently enabled/visible
   * @default true
   */
  enabled?: boolean;
}

export interface ShellConfiguration {
  /**
   * List of available remote applications
   */
  apps: RemoteApp[];

  /**
   * Application branding information
   */
  branding: {
    /**
     * Application title shown in header
     * @example "OnePortal"
     */
    title: string;

    /**
     * Optional logo URL
     */
    logoUrl?: string;
  };

  /**
   * Default preferences for new users
   */
  defaults?: {
    theme?: 'light' | 'dark' | 'system';
    language?: 'en' | 'es' | 'fr' | 'de';
  };
}

/**
 * Metadata for tracking loaded remote applications
 * Used internally by the remote loader service
 */
export interface RemoteMetadata {
  /**
   * Remote app configuration
   */
  app: RemoteApp;

  /**
   * Whether the remote is currently loaded
   */
  isLoaded: boolean;

  /**
   * Mount function to render the remote app
   */
  mount?: (containerId: string) => void | Promise<void>;

  /**
   * Unmount function to clean up the remote app
   */
  unmount?: (containerId: string) => void | Promise<void>;

  /**
   * Timestamp when the remote was loaded
   */
  loadedAt?: Date;

  /**
   * Error information if loading failed
   */
  error?: {
    message: string;
    timestamp: Date;
  };
}
