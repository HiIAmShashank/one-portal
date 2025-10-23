import { createFileRoute } from "@tanstack/react-router";
import { AuthLoadingSpinner } from "@one-portal/ui";

/**
 * Sign-in route for Domino remote app
 *
 * This route serves as a landing page during authentication flow:
 * - In standalone mode: OAuth redirect will return here
 * - In embedded mode: Unlikely to be accessed (Shell handles sign-in)
 *
 * The UnifiedAuthProvider handles the actual authentication logic via
 * MsalInitializer.initializeRemoteStandalone()
 */
export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
  beforeLoad: () => {
    // This is a public route - no authentication required
    // The user is being authenticated by Azure AD redirect
  },
});

function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <AuthLoadingSpinner
        title="Signing you in..."
        description="Please wait while we authenticate your session."
      />
    </div>
  );
}
