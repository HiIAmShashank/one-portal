import { useEffect, useState, type ReactNode } from 'react';
import { MsalProvider } from '@azure/msal-react';
import type { EventMessage } from '@azure/msal-browser';
import { EventType as MsalEventType } from '@azure/msal-browser';
import { AuthLoadingSpinner } from '@one-portal/ui';
import { msalInstance, getAuthConfig } from './msalInstance';
import { publishAuthEvent } from '@one-portal/auth/events';
import { getLoginHint } from '@one-portal/auth/utils';

interface ShellMSALProviderProps {
  children: ReactNode;
  routeType?: 'public' | 'protected' | 'callback';
}

export function ShellMSALProvider({ children, routeType }: ShellMSALProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasQuickCheck, setHasQuickCheck] = useState(false);

  const detectedRouteType = routeType ?? (() => {
    const path = window.location.pathname;
    if (path === '/sign-in') return 'public';
    if (path === '/auth/callback') return 'callback';
    return 'protected';
  })();

  useEffect(() => {
    console.log('[Shell] Detected route type:', detectedRouteType);
    if (detectedRouteType === 'protected') {
      const hasMsalCache = Object.keys(localStorage).some(key => key.startsWith('msal.'));

      if (!hasMsalCache) {
        setHasQuickCheck(true);
        setIsInitialized(true);
        return;
      }
    }

    setHasQuickCheck(true);
  }, [detectedRouteType]);

  useEffect(() => {
    if (!hasQuickCheck) return;

    let isMounted = true;

    async function handleAuthRedirect() {
      try {
        await msalInstance.initialize();
        const response = await msalInstance.handleRedirectPromise();

        if (!isMounted) return;

        if (response) {
          console.log('[Shell] Login successful:', response.account.username);
          const loginHint = getLoginHint(response.account);
          const accountId = response.account.homeAccountId;

          publishAuthEvent('auth:signed-in', {
            loginHint,
            accountId,
            appName: 'shell',
            clientId: getAuthConfig().clientId,
          });

          const urlParams = new URLSearchParams(window.location.search);
          const returnUrl = urlParams.get('returnUrl');

          if (returnUrl) {
            console.log('[Shell] Redirecting to:', returnUrl);
            window.location.href = decodeURIComponent(returnUrl);
            return;
          }
        } else {
          const accounts = msalInstance.getAllAccounts();

          if (accounts.length === 0) {
            console.log('[Shell] No accounts found, user needs to sign in');
          } else {
            const account = accounts[0];
            msalInstance.setActiveAccount(account);

            publishAuthEvent('auth:signed-in', {
              loginHint: getLoginHint(account),
              accountId: account.homeAccountId,
              appName: 'shell',
              clientId: getAuthConfig().clientId,
            });
          }
        }
      } catch (error) {
        console.error('[Shell] Initialization failed:', error);
        publishAuthEvent('auth:error', {
          error: {
            code: 'initialization_failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now(),
            appName: 'shell',
          },
        });
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    }
    handleAuthRedirect();

    return () => {
      isMounted = false;
    };
  }, [hasQuickCheck]);

  useEffect(() => {
    const callbackId = msalInstance.addEventCallback((event: EventMessage) => {
      if (event.eventType === MsalEventType.LOGOUT_SUCCESS) {
        console.log('[Shell] Logged out');
        publishAuthEvent('auth:signed-out', {
          appName: 'shell',
          clientId: getAuthConfig().clientId,
        });
      }
    });

    return () => {
      if (callbackId) {
        msalInstance.removeEventCallback(callbackId);
      }
    };
  }, []);

  if (!isInitialized && detectedRouteType !== 'public') {
    return (
      <>
        Testing
        <AuthLoadingSpinner
          title="Initializing authentication..."
          description="Please wait while we set up your session."
        />
      </>
    );
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
