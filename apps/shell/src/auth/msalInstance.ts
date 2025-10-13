// apps/shell/src/auth/msalInstance.ts
// MSAL instance for Shell app with interactive login capability

import { PublicClientApplication } from '@azure/msal-browser';
import { loadAuthConfig, createMsalConfig, validateMsalConfig } from '@one-portal/auth/config';

/**
 * Load auth configuration from environment variables
 */
const authConfig = loadAuthConfig('shell');

/**
 * Create MSAL configuration
 */
const msalConfig = createMsalConfig(authConfig);

/**
 * Validate configuration before creating instance
 */
validateMsalConfig(msalConfig);

/**
 * Shell MSAL instance - supports interactive login
 * This is the ONLY app that should trigger loginRedirect()
 */
export const msalInstance = new PublicClientApplication(msalConfig);

/**
 * Initialize MSAL instance
 * Call this before rendering the app
 */
export async function initializeMsal(): Promise<void> {
  try {
    await msalInstance.initialize();
  } catch (error) {
    console.error('[Shell MSAL] Initialization failed:', error);
    throw error;
  }
}

/**
 * Get the auth configuration (for debugging/telemetry)
 */
export function getAuthConfig() {
  return authConfig;
}
