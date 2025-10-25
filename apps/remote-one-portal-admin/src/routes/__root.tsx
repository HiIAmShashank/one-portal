import { createRootRoute, Outlet } from "@tanstack/react-router";
import { createProtectedRouteGuard } from "@one-portal/auth/guards";
import { safeRedirect } from "@one-portal/auth/utils";
import { msalInstance } from "../auth/msalInstance";
import { AppLayout } from "../components/AppLayout";
import { PUBLIC_ROUTES } from "../config/routes";

export const Route = createRootRoute({
  beforeLoad: async ({ location, preload }) => {
    // Skip authentication for public routes
    if (PUBLIC_ROUTES.includes(location.pathname as any)) {
      return;
    }

    // Detect if running in embedded mode (inside Shell) or standalone
    const isEmbeddedInShell = window.location.pathname.startsWith("/apps/");

    // Create route guard configuration based on mode
    // SECURITY: Always enforce authentication in both embedded and standalone modes
    const guard = createProtectedRouteGuard(msalInstance, {
      skipRedirectOnPreload: true, // Prevents redirects during lazy-loading
      onUnauthenticated: (returnUrl: string) => {
        if (isEmbeddedInShell) {
          // Embedded mode: Redirect to Shell sign-in
          const shellSignInUrl = `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`;
          safeRedirect(shellSignInUrl, "/sign-in");
        } else {
          // Standalone mode: Redirect to local sign-in route
          // The UnifiedAuthProvider will handle the interactive login redirect
          const localSignInUrl = `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`;
          safeRedirect(localSignInUrl, "/sign-in");
        }
      },
      onAuthError: (error: Error) => {
        console.error("[One Portal Admin] Route guard auth error:", error);
      },
    });

    await guard({ location, preload });
  },

  component: () => {
    const { pathname } = window.location;
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname as any);

    // Don't render AppLayout on public routes
    if (isPublicRoute) {
      return <Outlet />;
    }

    return (
      <AppLayout>
        <Outlet />
      </AppLayout>
    );
  },
});
