import type { ReactNode } from 'react';
import type { PublicClientApplication } from '@azure/msal-browser';
import type { AppMode } from '../utils/environment';

/**
 * Provider mode determines authentication behavior
 * 
 * - `host`: Shell/host application that handles OAuth redirects
 * - `remote`: Remote micro-frontend that uses SSO silent authentication
 */
export type AuthProviderMode = 'host' | 'remote';

/**
 * Route type affects loading spinner behavior
 * 
 * - `public`: No auth required (e.g., /sign-in)
 * - `protected`: Auth required (most routes)
 * - `callback`: OAuth redirect callback handler
 */
export type RouteType = 'public' | 'protected' | 'callback';

/**
 * Configuration for the UnifiedAuthProvider
 */
export interface UnifiedAuthProviderProps {
    /**
     * React children to render after authentication
     */
    children: ReactNode;

    /**
     * MSAL instance to use for authentication
     */
    msalInstance: PublicClientApplication;

    /**
     * Provider mode: 'host' for Shell, 'remote' for micro-frontends
     * 
     * @default 'host'
     */
    mode?: AuthProviderMode;

    /**
     * Application name for event publishing
     * 
     * @default 'shell' for host mode, 'remote' for remote mode
     */
    appName?: string;

    /**
     * Route type (auto-detected if not provided)
     * 
     * - Auto-detection logic:
     *   - `/sign-in` → 'public'
     *   - `/auth/callback` → 'callback'
     *   - Everything else → 'protected'
     */
    routeType?: RouteType;

    /**
     * Custom route type detector
     * Overrides default path-based detection
     */
    detectRouteType?: () => RouteType;

    /**
     * Get auth configuration (scopes, clientId, mode, etc.)
     */
    getAuthConfig: () => {
        scopes: string[];
        clientId: string;
        mode?: AppMode;
    };

    /**
     * Enable debug logging
     * 
     * @default false
     */
    debug?: boolean;
}

