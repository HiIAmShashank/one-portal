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
    if (isPublicRoute(location.pathname, PUBLIC_ROUTES)) {
      return;
    }
    const guard = createProtectedRouteGuard(msalInstance);
    await guard({ location });
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
      {
        id: "one-portal-admin",
        name: "One Portal Admin",
        remoteEntryUrl: "/one-portal-admin/assets/remoteEntry.js",
        moduleName: "one-portal-admin",
        scope: "one-portal-admin",
        displayOrder: 3,
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
