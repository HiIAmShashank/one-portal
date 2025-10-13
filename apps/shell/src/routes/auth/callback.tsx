import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { AuthLoadingSpinner } from '@one-portal/ui';
import { getAndClearReturnUrl } from '@one-portal/auth/utils';

/**
 * Auth callback route for Shell
 * Path: /auth/callback
 * 
 * This route handles the redirect return after Microsoft Entra ID authentication
 * The MSALProvider will automatically process the redirect via handleRedirectPromise()
 * This component just provides a loading state and navigates to the appropriate page
 */
export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackComponent,
});

function AuthCallbackComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get the return URL that was stored before auth redirect
    const returnUrl = getAndClearReturnUrl();
    
    // Small delay to ensure MSAL has processed the redirect
    const timer = setTimeout(() => {
      if (returnUrl) {
        // Navigate to the original requested URL
        window.location.href = returnUrl;
      } else {
        // No return URL - go to home
        navigate({ to: '/' });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AuthLoadingSpinner 
      title="Completing sign-in..." 
      description="Redirecting you to your destination."
    />
  );
}
