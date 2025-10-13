// apps/shell/src/auth/MSALProvider.tsx
// Shell Auth Provider - handles interactive login and event publishing

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

/**
 * Shell MSAL Provider
 * - Handles redirect promise on app mount
 * - Attempts silent SSO if no account
 * - Publishes auth:signed-in event when user authenticates
 * - Listens for auth:signed-out events from Remotes
 * - Supports different loading strategies based on route type:
 *   - 'public': Silent init, no loading spinner
 *   - 'protected': Quick check + conditional spinner
 *   - 'callback': Always show spinner (expected behavior)
 */
export function ShellMSALProvider({ children, routeType }: ShellMSALProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasQuickCheck, setHasQuickCheck] = useState(false);

  // Auto-detect route type if not provided
  const detectedRouteType = routeType ?? (() => {
    const path = window.location.pathname;
    if (path === '/sign-in') return 'public';
    if (path === '/auth/callback') return 'callback';
    return 'protected';
  })();

  // Quick check for protected routes: peek at localStorage without full MSAL init
  useEffect(() => {
    console.log('[Shell] Detected route type:', detectedRouteType);
    if (detectedRouteType === 'protected') {
      // Check if MSAL cache exists in localStorage
      const hasMsalCache = Object.keys(localStorage).some(key => key.startsWith('msal.'));
      
      if (!hasMsalCache) {
        // No MSAL cache = definitely not authenticated
        // Set quick check complete to trigger immediate redirect via route guard
        setHasQuickCheck(true);
        setIsInitialized(true);
        return;
      }
    }
    
    // For public routes or when cache exists, proceed with normal init
    setHasQuickCheck(true);
  }, [detectedRouteType]);

  useEffect(() => {
    if (!hasQuickCheck) return; // Wait for quick check to complete
    
    let isMounted = true;

    async function handleAuthRedirect() {
      try {
        // Initialize MSAL instance first
        await msalInstance.initialize();
        
        // Handle redirect promise (critical for interactive login flow)
        const response = await msalInstance.handleRedirectPromise();
        
        if (!isMounted) return;

        if (response) {
          // User just completed interactive login
          console.log('[Shell] Login successful:', response.account.username);
          
          // Publish signed-in event for Remotes to pick up
          const loginHint = getLoginHint(response.account);
          const accountId = response.account.homeAccountId;
          
          publishAuthEvent('auth:signed-in', {
            loginHint,
            accountId,
            appName: 'shell',
            clientId: getAuthConfig().clientId,
          });
          
          // Check for returnUrl query parameter and redirect
          const urlParams = new URLSearchParams(window.location.search);
          const returnUrl = urlParams.get('returnUrl');
          
          if (returnUrl) {
            console.log('[Shell] Redirecting to:', returnUrl);
            window.location.href = decodeURIComponent(returnUrl);
            return;
          }
        } else {
          // No redirect response - check if user has existing session
          const accounts = msalInstance.getAllAccounts();
          
          if (accounts.length === 0) {
            // No accounts and no active session
            // Don't attempt ssoSilent() - it will fail and cause iframe errors
            // Let the route guard handle redirect to sign-in page
            console.log('[Shell] No accounts found, user needs to sign in');
          } else {
            // User has existing account - publish event
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
    // Run auth initialization
    handleAuthRedirect();

    return () => {
      isMounted = false;
    };
  }, [hasQuickCheck]);

  // Listen for MSAL events
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

  // Show loading spinner only for protected routes and callback routes
  // Public routes (like sign-in) initialize silently
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
