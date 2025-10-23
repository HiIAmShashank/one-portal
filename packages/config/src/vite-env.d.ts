/// <reference types="vite/client" />

interface ImportMetaEnv extends Record<string, unknown> {
  // Azure AD Authentication
  readonly VITE_AUTH_CLIENT_ID: string;
  readonly VITE_AUTH_AUTHORITY: string;
  readonly VITE_AUTH_REDIRECT_URI?: string;
  readonly VITE_AUTH_POST_LOGOUT_REDIRECT_URI?: string;
  readonly VITE_AUTH_SCOPES?: string;
  readonly VITE_AUTH_APP_NAME?: string;

  // API Configuration
  readonly VITE_API_BASE_URL?: string;

  // Application Mode
  readonly VITE_APP_MODE?: 'embedded' | 'standalone' | 'auto';

  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
