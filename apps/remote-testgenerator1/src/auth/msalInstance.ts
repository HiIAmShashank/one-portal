// apps/remote-testgenerator1/src/auth/msalInstance.ts
import { PublicClientApplication } from '@azure/msal-browser';
import { loadAuthConfig, createMsalConfig, validateMsalConfig } from '@one-portal/auth/config';

/**
 * MSAL Instance for Test Gen 1
 * 
 * This instance is configured with the app-specific Azure AD client ID
 * for token isolation. Each remote app must have its own MSAL instance.
 * 
 * Configuration is loaded from environment variables in .env.local
 * 
 * Requirements: FR-005 (Authentication), US2 (Protected Routes)
 */

const authConfig = loadAuthConfig('testgenerator1');
const msalConfig = createMsalConfig(authConfig);
validateMsalConfig(msalConfig);

export const msalInstance = new PublicClientApplication(msalConfig);

export function getAuthConfig() {
  return authConfig;
}
