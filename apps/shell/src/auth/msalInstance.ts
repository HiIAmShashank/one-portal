import { PublicClientApplication } from '@azure/msal-browser';
import { loadAuthConfig, createMsalConfig, validateMsalConfig } from '@one-portal/auth/config';

const authConfig = loadAuthConfig('shell');
const msalConfig = createMsalConfig(authConfig);
validateMsalConfig(msalConfig);

export const msalInstance = new PublicClientApplication(msalConfig);

export async function initializeMsal(): Promise<void> {
  try {
    await msalInstance.initialize();
  } catch (error) {
    console.error('[Shell MSAL] Initialization failed:', error);
    throw error;
  }
}

export function getAuthConfig() {
  return authConfig;
}
