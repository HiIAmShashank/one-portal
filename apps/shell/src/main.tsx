import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { UnifiedAuthProvider, isAuthError } from "@one-portal/auth";
import { msalInstance, getAuthConfig } from "./auth/msalInstance";
import { router } from "./router";
import { Sonner } from "@one-portal/ui";
import "./style.css";
import "@one-portal/ui/styles.css";
import { validateShellEnv, createQueryClient } from "@one-portal/config";
import { PUBLIC_ROUTES } from "./config/routes";

try {
  validateShellEnv();
} catch (error) {
  console.error(error);
  document.body.innerHTML = `
    <div style="padding: 2rem; color: red;">
      <h1>Configuration Error</h1>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
  throw error;
}

const queryClient = createQueryClient({ shouldSkipRetry: isAuthError });

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <UnifiedAuthProvider
      msalInstance={msalInstance}
      mode="host"
      appName="shell"
      getAuthConfig={getAuthConfig}
      debug={import.meta.env.DEV}
      publicRoutes={PUBLIC_ROUTES}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </UnifiedAuthProvider>
    <Sonner />
  </StrictMode>,
);
