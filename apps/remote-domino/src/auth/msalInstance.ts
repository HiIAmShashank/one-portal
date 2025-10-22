import { PublicClientApplication } from '@azure/msal-browser';
import { loadAuthConfig, createMsalConfig, validateMsalConfig } from '@one-portal/auth/config';

const authConfig = loadAuthConfig('domino');
const msalConfig = createMsalConfig(authConfig);
validateMsalConfig(msalConfig);

export const msalInstance = new PublicClientApplication(msalConfig);

export function getAuthConfig() {
  return authConfig;
}
