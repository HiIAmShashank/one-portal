// apps/remote-reports/src/auth/MSALProvider.tsx
import { useEffect, useState, type ReactNode } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { EventType as MsalEventType } from '@azure/msal-browser';
import { AuthLoadingSpinner } from '@one-portal/ui';
import { msalInstance, getAuthConfig } from './msalInstance';
import { subscribeToAuthEvents } from '@one-portal/auth/events';

interface ReportsMSALProviderProps {
  children: ReactNode;
}

/**
 * Reports MSAL Provider
 * - Attempts silent SSO on mount
 * - Redirects to Shell if authentication fails
 * - Listens for auth events from Shell
 */
export function ReportsMSALProvider({ children }: ReportsMSALProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        // Initialize MSAL instance first
        await msalInstance.initialize();
        await msalInstance.handleRedirectPromise();
        if (!isMounted) return;

        const accounts = msalInstance.getAllAccounts();
        
        if (accounts.length > 0) {
          msalInstance.setActiveAccount(accounts[0]);
          
          try {
            await msalInstance.acquireTokenSilent({
              scopes: getAuthConfig().scopes,
              account: accounts[0],
            });
            setIsInitialized(true);
          } catch (error: any) {
            // Try SSO with login hint
            try {
              const ssoResult = await msalInstance.ssoSilent({
                scopes: getAuthConfig().scopes,
                loginHint: accounts[0].username,
              });
              msalInstance.setActiveAccount(ssoResult.account);
              setIsInitialized(true);
            } catch (ssoError) {
              // SSO failed - only redirect if actually visible
              if (document.visibilityState === 'visible') {
                console.error('[Reports] SSO failed, redirecting to Shell:', ssoError);
                const returnUrl = encodeURIComponent(window.location.href);
                window.location.href = `/?returnUrl=${returnUrl}`;
              } else {
                // App is being preloaded, just mark as initialized
                if (import.meta.env.DEV) {
                  console.log('[Reports] SSO failed (preload), skipping redirect');
                }
                setIsInitialized(true);
              }
            }
          }
        } else {
          // No account - try silent SSO
          try {
            const ssoResult = await msalInstance.ssoSilent({
              scopes: getAuthConfig().scopes,
            });
            msalInstance.setActiveAccount(ssoResult.account);
            setIsInitialized(true);
          } catch (error) {
            // No session available
            // Only redirect if the app is actually visible (not just preloaded)
            if (document.visibilityState === 'visible') {
              console.error('[Reports] No session, redirecting to Shell:', error);
              const returnUrl = encodeURIComponent(window.location.href);
              window.location.href = `/?returnUrl=${returnUrl}`;
            } else {
              // App is being preloaded, just mark as initialized
              if (import.meta.env.DEV) {
                console.log('[Reports] No session (preload), skipping redirect');
              }
              setIsInitialized(true);
            }
          }
        }
      } catch (error) {
        console.error('[Reports] Initialization failed:', error);
        if (isMounted) setIsInitialized(true);
      }
    }

    initializeAuth();
    return () => { isMounted = false; };
  }, []);

  // Listen for auth events from Shell
  useEffect(() => {
    const unsubscribe = subscribeToAuthEvents(async (event) => {
      if (event.type === 'auth:signed-in' && event.payload?.loginHint) {
        try {
          const ssoResult = await msalInstance.ssoSilent({
            scopes: getAuthConfig().scopes,
            loginHint: event.payload.loginHint,
          });
          msalInstance.setActiveAccount(ssoResult.account);
        } catch (error: any) {
          if (error.errorCode === 'interaction_required') {
            const returnUrl = encodeURIComponent(window.location.href);
            window.location.href = `/?returnUrl=${returnUrl}`;
          }
        }
      } else if (event.type === 'auth:signed-out') {
        // Clear MSAL cache - don't reload, let auth guard handle redirect
        if (import.meta.env.DEV) {
          console.log('[Reports] Received auth:signed-out event, clearing cache');
        }
        
        // Clear active account
        msalInstance.setActiveAccount(null);
        
        // Clear browser cache (localStorage)
        localStorage.clear();
        
        // Note: We don't reload here to avoid conflicts with router preloading.
        // The auth guard will redirect to sign-in when user actually navigates.
      }
    });

    return unsubscribe;
  }, []);

  // Listen for MSAL events
  useEffect(() => {
    const callbackId = msalInstance.addEventCallback((event: any) => {
      if (event.eventType === MsalEventType.LOGOUT_SUCCESS) {
        console.log('[Reports] Logged out');
      }
    });

    return () => {
      if (callbackId) {
        msalInstance.removeEventCallback(callbackId);
      }
    };
  }, []);

  if (!isInitialized) {
    return (
      <AuthLoadingSpinner 
        title="Initializing authentication..." 
        description="Please wait while we set up your session."
      />
    );
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
