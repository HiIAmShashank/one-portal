// apps/shell/src/routes/sign-in.tsx
// Dedicated sign-in route with returnUrl support

import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useMsal } from '@azure/msal-react';
import { useEffect, useRef, useState } from 'react';
import { SignInPrompt, toast } from '@one-portal/ui';
import { getAuthConfig } from '../auth/msalInstance';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@one-portal/ui';
import { AuthLoadingSpinner } from '@one-portal/ui';
/**
 * Sign-in route with returnUrl preservation
 * Path: /sign-in?returnUrl=...
 */
export const Route = createFileRoute('/sign-in')({
    component: SignInComponent,
    validateSearch: (search: Record<string, unknown>): { returnUrl?: string; 'signed-out'?: string } => {
        return {
            returnUrl: typeof search.returnUrl === 'string' ? search.returnUrl : undefined,
            'signed-out': typeof search['signed-out'] === 'string' ? search['signed-out'] : undefined,
        };
    },
});

function SignInComponent() {
    const { instance, accounts } = useMsal();
    const navigate = useNavigate();
    const search = useSearch({ from: '/sign-in' });
    const signInButtonRef = useRef<HTMLButtonElement>(null);
    const isAuthenticated = accounts.length > 0;
    
    // Screen reader announcement state (T095: US5, T114: US7)
    const [srAnnouncement, setSrAnnouncement] = useState('');

    /**
     * Announce auth state changes to screen readers (T114: US7)
     * Sets temporary announcement that auto-clears after 3 seconds
     */
    const announceToScreenReader = (message: string) => {
        setSrAnnouncement(message);
        setTimeout(() => setSrAnnouncement(''), 3000);
    };

    // Focus management for accessibility (T060)
    useEffect(() => {
        if (signInButtonRef.current) {
            signInButtonRef.current.focus();
        }
    }, []);

    // Show sign-out confirmation toast (T094: US5)
    useEffect(() => {
        // Check if user was just signed out (from returnUrl parameter or direct param)
        const returnUrl = search.returnUrl;
        const signedOut = returnUrl?.includes('signed-out=true') || search['signed-out'] === 'true';
        
        if (signedOut) {
            toast.success('You have been signed out of all apps', {
                duration: 4000,
                description: 'Please sign in again to continue.',
            });
            
            // Screen reader announcement (T095: US5, T114: US7)
            announceToScreenReader('Signed out successfully. You have been signed out of all apps.');
        }
    }, [search]);

    // If already authenticated, redirect to returnUrl or home
    useEffect(() => {
        if (isAuthenticated) {
            const destination = search.returnUrl || '/';
            navigate({ to: destination });
        }
    }, [isAuthenticated, search.returnUrl, navigate]);

    /**
     * Handle interactive login
     * After successful login, user will be redirected back via handleRedirectPromise
     * which will check for returnUrl in query params
     */
    const handleSignIn = async () => {
        try {
            // Store returnUrl in sessionStorage for post-login redirect
            if (search.returnUrl) {
                sessionStorage.setItem('auth_return_url', search.returnUrl);
            }

            await instance.loginRedirect({
                scopes: getAuthConfig().scopes,
                prompt: 'select_account',
            });
        } catch (error) {
            console.error('[Shell] Login error:', error);
        }
    };

    return (
        <div className='flex min-h-[calc(100vh-63px)] items-center justify-center bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark p-4'>
        {/* Screen reader announcements (T095: US5) */}
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
        >
            {srAnnouncement}
        </div>
        
        <Card className="shadow-xl w-full max-w-md border-none ">
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
            </CardHeader>
            <CardContent>
                <SignInPrompt
                    onSignIn={handleSignIn}
                    ref={signInButtonRef}
                />
            </CardContent>
        </Card>
        <div className='hidden'>
        <AuthLoadingSpinner 
          title="Test message" 
          description="This is a test description."
        />
        </div>
        </div>
    );
}
