import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { AuthLoadingSpinner } from '@one-portal/ui';
import { getAndClearReturnUrl } from '@one-portal/auth/utils';

export const Route = createFileRoute('/auth/callback')({
    component: AuthCallbackComponent,
});

function AuthCallbackComponent() {
    const navigate = useNavigate();

    useEffect(() => {
        const isEmbeddedInShell = window.location.pathname.startsWith('/apps/');

        if (!isEmbeddedInShell && import.meta.env.DEV) {
            console.warn('[Domino] Auth callback reached in standalone mode, redirecting to home');
            navigate({ to: '/' });
            return;
        }

        const returnUrl = getAndClearReturnUrl();

        const timer = setTimeout(() => {
            if (returnUrl) {
                window.location.href = returnUrl;
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