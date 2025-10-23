import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { AuthLoadingSpinner } from '@one-portal/ui';
import { getAndClearReturnUrl, safeRedirect } from '@one-portal/auth/utils';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackComponent,
});

function AuthCallbackComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    const returnUrl = getAndClearReturnUrl();

    const timer = setTimeout(() => {
      if (returnUrl) {
        safeRedirect(returnUrl, '/');
      } else {
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
