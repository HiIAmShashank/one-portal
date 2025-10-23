import { PublicClientApplication, type IPublicClientApplication } from '@azure/msal-browser';
import { loadAuthConfig, createMsalConfig, validateMsalConfig } from '../config';

/**
 * Creates and initializes a PublicClientApplication instance for the specified app.
 * 
 * This factory function encapsulates the common pattern of loading configuration,
 * creating MSAL config, validating it, and instantiating the PublicClientApplication.
 * 
 * @param appName - The name of the application (e.g., 'shell', 'domino')
 * @returns A new PublicClientApplication instance
 * 
 * @example
 * ```typescript
 * // In apps/shell/src/auth/msalInstance.ts
 * export const msalInstance = createMsalInstance('shell');
 * ```
 * 
 * @throws {Error} If required environment variables are missing
 * @throws {Error} If configuration validation fails
 */
export function createMsalInstance(appName: string): IPublicClientApplication {
    try {
        // Load auth configuration from environment variables
        const authConfig = loadAuthConfig(appName);

        // Create MSAL configuration object
        const msalConfig = createMsalConfig(authConfig);

        // Validate the configuration
        validateMsalConfig(msalConfig);

        // Create and return the PublicClientApplication instance
        return new PublicClientApplication(msalConfig);
    } catch (error) {
        console.error(`[createMsalInstance] Failed to create MSAL instance for app "${appName}":`, error);
        throw error;
    }
}

/**
 * Creates a PublicClientApplication instance and returns it along with the auth config.
 * Useful when you need access to both the instance and the original configuration.
 * 
 * @param appName - The name of the application
 * @returns Object containing the MSAL instance and auth config
 */
export function createMsalInstanceWithConfig(appName: string) {
    const authConfig = loadAuthConfig(appName);
    const msalConfig = createMsalConfig(authConfig);
    validateMsalConfig(msalConfig);
    const instance = new PublicClientApplication(msalConfig);

    return {
        instance,
        authConfig,
    };
}
