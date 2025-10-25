/**
 * Route configuration for One Portal Admin
 *
 * PUBLIC_ROUTES: Routes that do not require authentication
 * - /sign-in: Sign-in page for standalone mode
 * - /auth/callback: OAuth callback handler
 */

export const PUBLIC_ROUTES = ["/sign-in", "/auth/callback"] as const;

export type PublicRoute = (typeof PUBLIC_ROUTES)[number];
