import type { Configuration } from '@azure/msal-browser';
import type { AuthConfig } from '../types/auth';
import type { AppMode } from '../utils/environment';

const ENV_PREFIX = 'VITE_AUTH_';

export function loadAuthConfig(appName: string): AuthConfig {
  const clientId = import.meta.env[`${ENV_PREFIX}CLIENT_ID`] as string | undefined;
  const authority = import.meta.env[`${ENV_PREFIX}AUTHORITY`] as string | undefined;
  const redirectUri = import.meta.env[`${ENV_PREFIX}REDIRECT_URI`] as string | undefined;
  const postLogoutRedirectUri = import.meta.env[`${ENV_PREFIX}POST_LOGOUT_REDIRECT_URI`] as string | undefined;
  const scopesStr = import.meta.env[`${ENV_PREFIX}SCOPES`] as string | undefined;
  const mode = import.meta.env.VITE_APP_MODE as AppMode | undefined;

  if (!clientId) {
    throw new Error(`${ENV_PREFIX}CLIENT_ID is required but not defined`);
  }
  if (!authority) {
    throw new Error(`${ENV_PREFIX}AUTHORITY is required but not defined`);
  }
  if (!redirectUri) {
    throw new Error(`${ENV_PREFIX}REDIRECT_URI is required but not defined`);
  }

  const scopes = scopesStr ? scopesStr.split(',').map(s => s.trim()) : ['User.Read'];

  return {
    clientId,
    authority,
    redirectUri,
    postLogoutRedirectUri: postLogoutRedirectUri || window.location.origin,
    scopes,
    appName,
    mode: mode ?? 'auto',
  };
}

export function createMsalConfig(authConfig: AuthConfig): Configuration {
  const isDev = import.meta.env.DEV;

  return {
    auth: {
      clientId: authConfig.clientId,
      authority: authConfig.authority,
      redirectUri: authConfig.redirectUri,
      postLogoutRedirectUri: authConfig.postLogoutRedirectUri,
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) return;

          switch (level) {
            case 0: // Error
              console.error(`[MSAL:${authConfig.appName}]`, message);
              break;
            case 1: // Warning
              console.warn(`[MSAL:${authConfig.appName}]`, message);
              break;
            case 2: // Info
            case 3: // Verbose
              if (isDev) {
                console.log(`[MSAL:${authConfig.appName}]`, message);
              }
              break;
          }
        },
        logLevel: 1, // Verbose in dev, Warning in prod
        piiLoggingEnabled: false,
      },
      allowNativeBroker: false,
    },
    telemetry: {
      application: {
        appName: authConfig.appName,
        appVersion: '1.0.0',
      },
    },
  };
}

export function validateMsalConfig(config: Configuration): boolean {
  // if (!config.auth.clientId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.auth.clientId)) {
  //   throw new Error('Invalid clientId: must be a valid GUID');
  // }

  if (!config.auth.authority || !config.auth.authority.startsWith('https://login.microsoftonline.com/')) {
    throw new Error('Invalid authority: must start with https://login.microsoftonline.com/');
  }

  if (!config.auth.redirectUri || !/^https?:\/\/.+/.test(config.auth.redirectUri)) {
    throw new Error('Invalid redirectUri: must be a valid HTTP(S) URL');
  }

  return true;
}
