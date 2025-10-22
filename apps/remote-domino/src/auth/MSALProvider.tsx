import { useEffect, useState, type ReactNode } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { EventType as MsalEventType } from '@azure/msal-browser';
import { AuthLoadingSpinner } from '@one-portal/ui';
import { msalInstance, getAuthConfig } from './msalInstance';
import { subscribeToAuthEvents } from '@one-portal/auth/events';

interface DominoMSALProviderProps {
  children: ReactNode;
}

export function DominoMSALProvider({ children }: DominoMSALProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
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
            try {
              const ssoResult = await msalInstance.ssoSilent({
                scopes: getAuthConfig().scopes,
                loginHint: accounts[0].username,
              });
              msalInstance.setActiveAccount(ssoResult.account);
              setIsInitialized(true);
            } catch (ssoError) {
              const isEmbeddedInShell = window.location.pathname.startsWith('/apps/');

              if (!isEmbeddedInShell && import.meta.env.DEV) {
                console.log('[Domino] SSO failed in standalone mode, skipping redirect');
                setIsInitialized(true);
              } else if (document.visibilityState === 'visible') {
                console.error('[Domino] SSO failed, redirecting to Shell:', ssoError);
                const returnUrl = encodeURIComponent(window.location.href);
                window.location.href = `/?returnUrl=${returnUrl}`;
              } else {
                if (import.meta.env.DEV) {
                  console.log('[Domino] SSO failed (preload), skipping redirect');
                }
                setIsInitialized(true);
              }
            }
          }
        } else {
          try {
            const ssoResult = await msalInstance.ssoSilent({
              scopes: getAuthConfig().scopes,
            });
            msalInstance.setActiveAccount(ssoResult.account);
            setIsInitialized(true);
          } catch (error) {
            const isEmbeddedInShell = window.location.pathname.startsWith('/apps/');

            if (!isEmbeddedInShell && import.meta.env.DEV) {
              console.log('[Domino] No session in standalone mode, skipping redirect');
              setIsInitialized(true);
            } else if (document.visibilityState === 'visible') {
              console.error('[Domino] No session, redirecting to Shell:', error);
              const returnUrl = encodeURIComponent(window.location.href);
              window.location.href = `/?returnUrl=${returnUrl}`;
            } else {
              if (import.meta.env.DEV) {
                console.log('[Domino] No session (preload), skipping redirect');
              }
              setIsInitialized(true);
            }
          }
        }
      } catch (error) {
        console.error('[Domino] Initialization failed:', error);
        if (isMounted) setIsInitialized(true);
      }
    }

    initializeAuth();
    return () => { isMounted = false; };
  }, []);

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
            // Check if running in standalone dev mode
            const isEmbeddedInShell = window.location.pathname.startsWith('/apps/');

            if (isEmbeddedInShell) {
              // Only redirect when in Shell context
              const returnUrl = encodeURIComponent(window.location.href);
              window.location.href = `/?returnUrl=${returnUrl}`;
            } else if (import.meta.env.DEV) {
              console.log('[Domino] Interaction required in standalone mode, skipping redirect');
            }
          }
        }
      } else if (event.type === 'auth:signed-out') {
        // Clear MSAL cache - don't reload, let auth guard handle redirect
        if (import.meta.env.DEV) {
          console.log('[Domino] Received auth:signed-out event, clearing cache');
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

  useEffect(() => {
    const callbackId = msalInstance.addEventCallback((event: any) => {
      if (event.eventType === MsalEventType.LOGOUT_SUCCESS) {
        console.log('[Domino] Logged out');
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
