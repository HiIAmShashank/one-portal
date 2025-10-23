import { z } from 'zod';

/**
 * Environment variable schema for the shell application
 * Validates all required environment variables at runtime
 */
export const shellEnvSchema = z.object({
  // Azure AD Authentication
  VITE_AUTH_CLIENT_ID: z.string().min(1, 'Auth Client ID is required'),
  VITE_AUTH_AUTHORITY: z.string().url('Auth Authority must be a valid URL'),
  VITE_AUTH_REDIRECT_URI: z.string().url('Redirect URI must be a valid URL').optional(),
  VITE_AUTH_POST_LOGOUT_REDIRECT_URI: z.string().url('Post-logout redirect URI must be a valid URL').optional(),
  VITE_AUTH_SCOPES: z.string().optional(),
  VITE_AUTH_APP_NAME: z.string().optional(),

  // API Configuration
  VITE_API_BASE_URL: z.string().url('API Base URL must be a valid URL').optional(),

  // Application Mode
  VITE_APP_MODE: z.enum(['embedded', 'standalone', 'auto']).optional(),

  // Feature Flags
  VITE_ENABLE_ANALYTICS: z.enum(['true', 'false']).optional().default('false'),
  VITE_ENABLE_DEBUG: z.enum(['true', 'false']).optional().default('false'),
});

/**
 * Environment variable schema for remote applications
 */
export const remoteEnvSchema = z.object({
  // Azure AD Authentication
  VITE_AUTH_CLIENT_ID: z.string().min(1, 'Auth Client ID is required'),
  VITE_AUTH_AUTHORITY: z.string().url('Auth Authority must be a valid URL'),
  VITE_AUTH_REDIRECT_URI: z.string().url('Redirect URI must be a valid URL').optional(),
  VITE_AUTH_POST_LOGOUT_REDIRECT_URI: z.string().url('Post-logout redirect URI must be a valid URL').optional(),
  VITE_AUTH_SCOPES: z.string().optional(),
  VITE_AUTH_APP_NAME: z.string().optional(),

  // API Configuration
  VITE_API_BASE_URL: z.string().url('API Base URL must be a valid URL').optional(),

  // Application Mode
  VITE_APP_MODE: z.enum(['embedded', 'standalone', 'auto']).optional(),
});

export type ShellEnv = z.infer<typeof shellEnvSchema>;
export type RemoteEnv = z.infer<typeof remoteEnvSchema>;

/**
 * Validates environment variables and throws if invalid
 * @param schema - Zod schema to validate against
 * @param env - Environment variables to validate (defaults to import.meta.env)
 */
export function validateEnv<T>(
  schema: z.ZodSchema<T>,
  env: Record<string, unknown> = import.meta.env
): T {
  const result = schema.safeParse(env);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );
    
    console.error('❌ Environment validation failed:');
    errors.forEach((error) => console.error(`  - ${error}`));
    
    throw new Error(
      `Environment validation failed:\n${errors.join('\n')}\n\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  return result.data;
}

/**
 * Validates shell environment variables
 * Call this in main.tsx before rendering the app
 */
export function validateShellEnv() {
  return validateEnv(shellEnvSchema);
}

/**
 * Validates remote environment variables
 * Call this in remote main.tsx before rendering the app
 */
export function validateRemoteEnv() {
  return validateEnv(remoteEnvSchema);
}
