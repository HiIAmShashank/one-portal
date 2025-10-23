import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { ThemeProvider } from "../components/ThemeProvider";
import {
  createProtectedRouteGuard,
  isPublicRoute,
} from "@one-portal/auth/guards";
import { msalInstance } from "../auth/msalInstance";
import { PUBLIC_ROUTES } from "../config/routes";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    // Debug: Log every route navigation
    console.info("[Shell Root] beforeLoad START:", location.pathname);
    console.info("[Shell Root] PUBLIC_ROUTES:", PUBLIC_ROUTES);
    console.info(
      "[Shell Root] isPublicRoute check:",
      isPublicRoute(location.pathname, PUBLIC_ROUTES),
    );

    // Skip authentication for public routes
    if (isPublicRoute(location.pathname, PUBLIC_ROUTES)) {
      console.info(
        "[Shell Root] Public route, skipping guard:",
        location.pathname,
      );
      return;
    }

    console.info(
      "[Shell Root] Protected route, running guard:",
      location.pathname,
    );
    console.info(
      "[Shell Root] MSAL accounts:",
      msalInstance.getAllAccounts().length,
    );

    // Use preset guard for protected routes
    const guard = createProtectedRouteGuard(msalInstance);
    await guard({ location });

    console.info("[Shell Root] Guard completed for:", location.pathname);
  },

  component: () => {
    const mockApps = [
      {
        id: "domino",
        name: "Domino",
        remoteEntryUrl: "/domino/assets/remoteEntry.js",
        moduleName: "domino",
        scope: "domino",
        displayOrder: 2,
      },
    ];

    return (
      <ThemeProvider defaultTheme="system" storageKey="one-portal-ui-theme">
        <div className="flex min-h-screen flex-col bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
          <Header apps={mockApps} />
          <main className="flex-1 grow min-h-[calc(100vh-70px)] overflow-hidden">
            {/* This is where child routes will render */}
            <Outlet />
          </main>
        </div>
      </ThemeProvider>
    );
  },
});
