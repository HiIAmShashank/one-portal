import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useAuth } from "@one-portal/auth/hooks";
import { useEffect, useRef, useState } from "react";
import { SignInPrompt, toast } from "@one-portal/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@one-portal/ui";
import { setReturnUrl } from "@one-portal/auth/utils";

export const Route = createFileRoute("/sign-in")({
  component: SignInComponent,
  validateSearch: (
    search: Record<string, unknown>,
  ): { returnUrl?: string; "signed-out"?: string } => {
    const result: { returnUrl?: string; "signed-out"?: string } = {};
    if (typeof search.returnUrl === "string") {
      result.returnUrl = search.returnUrl;
    }
    if (typeof search["signed-out"] === "string") {
      result["signed-out"] = search["signed-out"];
    }
    return result;
  },
});

function SignInComponent() {
  const { state, login } = useAuth();
  const { isAuthenticated } = state;
  const navigate = useNavigate();
  const search = useSearch({ from: "/sign-in" });
  const signInButtonRef = useRef<HTMLButtonElement>(null);

  const [srAnnouncement, setSrAnnouncement] = useState(""); /**
   * Announce auth state changes to screen readers (T114: US7)
   * Sets temporary announcement that auto-clears after 3 seconds
   */
  const announceToScreenReader = (message: string) => {
    setSrAnnouncement(message);
    setTimeout(() => setSrAnnouncement(""), 3000);
  };

  // Focus management for accessibility (T060)
  useEffect(() => {
    if (signInButtonRef.current) {
      signInButtonRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const returnUrl = search.returnUrl;
    const signedOut =
      returnUrl?.includes("signed-out=true") || search["signed-out"] === "true";

    if (signedOut) {
      toast.success("You have been signed out of all apps", {
        duration: 4000,
        description: "Please sign in again to continue.",
      });

      announceToScreenReader(
        "Signed out successfully. You have been signed out of all apps.",
      );
    }
  }, [search]); // If already authenticated, redirect to returnUrl or home
  useEffect(() => {
    if (isAuthenticated) {
      const destination = search.returnUrl || "/";
      navigate({ to: destination });
    }
  }, [isAuthenticated, search.returnUrl, navigate]);

  /**
   * Handle interactive login
   * After successful login, user will be redirected back via handleRedirectPromise
   * which will read returnUrl from localStorage
   */
  const handleSignIn = async () => {
    try {
      if (search.returnUrl) {
        setReturnUrl(search.returnUrl);
      }
      await login();
    } catch (error) {
      console.error("[Shell] Login error:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[linear-gradient(156deg,var(--color-primary),var(--color-secondary))] flex items-center justify-center p-6">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {srAnnouncement}
      </div>

      <Card className="bg-background text-foreground dark:bg-background dark:text-foreground w-full max-w-md border-none shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="space-y-4 mb-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to One Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              Your centralized platform to access Mott MacDonald applications
            </p>
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight">
            Sign in to your account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SignInPrompt onSignIn={handleSignIn} ref={signInButtonRef} />
        </CardContent>
      </Card>
    </div>
  );
}
