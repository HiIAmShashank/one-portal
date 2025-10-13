// NAA Debug Snippet
// Add this to apps/remote-billing/src/auth/msalInstance.ts (and reports)
// to verify if NAA is actually initialized and working

import { createNestablePublicClientApplication, type IPublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '@one-portal/auth';

let msalInstanceCache: IPublicClientApplication | null = null;
let msalInstancePromise: Promise<IPublicClientApplication> | null = null;

export async function getMsalInstance(): Promise<IPublicClientApplication> {
  if (msalInstanceCache) {
    console.log('[NAA Debug] Returning cached instance');
    return msalInstanceCache;
  }

  if (!msalInstancePromise) {
    console.log('[NAA Debug] Creating new nestable instance...');
    msalInstancePromise = createNestablePublicClientApplication(msalConfig);
  }

  msalInstanceCache = await msalInstancePromise;

  // ========== NAA VERIFICATION CHECKS ==========
  
  console.group('[NAA Debug] Instance Verification');
  
  // Check 1: Instance type
  console.log('1. Instance constructor:', msalInstanceCache.constructor.name);
  
  // Check 2: NAA-specific properties
  console.log('2. Has bridgeProxy property?', 'bridgeProxy' in msalInstanceCache);
  console.log('3. Has naa property?', 'naa' in msalInstanceCache);
  
  // Check 3: Configuration
  console.log('4. Config supportsNestedAppAuth?', msalConfig.auth.supportsNestedAppAuth);
  console.log('5. Config cacheLocation?', msalConfig.cache?.cacheLocation);
  
  // Check 4: BroadcastChannel detection
  const originalBC = window.BroadcastChannel;
  let broadcastChannelCreated = false;
  window.BroadcastChannel = function(name: string) {
    console.log(`6. BroadcastChannel created: "${name}" (NAA uses this for parent-child communication)`);
    broadcastChannelCreated = true;
    return new originalBC(name);
  } as any;
  
  // Check 5: Internal NAA state (if accessible)
  try {
    const internalState = (msalInstanceCache as any).naa || (msalInstanceCache as any).bridgeProxy;
    if (internalState) {
      console.log('7. NAA internal state detected:', Object.keys(internalState));
    } else {
      console.warn('7. No NAA internal state found - may not be using NAA');
    }
  } catch (e) {
    console.log('7. Cannot access internal state (expected for production build)');
  }
  
  console.groupEnd();
  
  // ========== RUNTIME NAA DETECTION ==========
  
  setTimeout(() => {
    console.group('[NAA Debug] Runtime Check (after 1 second)');
    console.log('BroadcastChannel was created?', broadcastChannelCreated);
    
    if (!broadcastChannelCreated) {
      console.warn('⚠️ NAA NOT ACTIVE - No BroadcastChannel detected');
      console.log('Likely using standard MSAL with third-party cookies');
    } else {
      console.log('✅ NAA LIKELY ACTIVE - BroadcastChannel communication detected');
    }
    console.groupEnd();
    
    // Restore original BroadcastChannel
    window.BroadcastChannel = originalBC;
  }, 1000);

  return msalInstanceCache;
}

// ========== ADDITIONAL DETECTION IN MSALProvider.tsx ==========

// Add this useEffect to your MSALProvider component:

/*
useEffect(() => {
  if (!msalInstance) return;

  console.group('[NAA Debug] Auth Flow Detection');
  
  // Monitor which MSAL methods are called
  const originalAcquireTokenSilent = msalInstance.acquireTokenSilent;
  const originalSsoSilent = msalInstance.ssoSilent;
  
  msalInstance.acquireTokenSilent = async function(...args: any[]) {
    console.log('[NAA Debug] acquireTokenSilent called - checking cache first');
    try {
      const result = await originalAcquireTokenSilent.apply(this, args);
      console.log('[NAA Debug] acquireTokenSilent SUCCESS - token from cache or NAA bridge');
      return result;
    } catch (e: any) {
      console.log('[NAA Debug] acquireTokenSilent FAILED -', e.errorCode);
      throw e;
    }
  };
  
  msalInstance.ssoSilent = async function(...args: any[]) {
    console.log('[NAA Debug] ssoSilent called - attempting silent SSO');
    console.log('[NAA Debug] If NAA is working, this should use parent app session');
    console.log('[NAA Debug] If NAA is NOT working, this uses third-party cookies');
    
    try {
      const result = await originalSsoSilent.apply(this, args);
      console.log('[NAA Debug] ssoSilent SUCCESS');
      
      // Check iframe usage (third-party cookies approach uses iframe)
      const iframes = document.querySelectorAll('iframe[src*="login.microsoftonline.com"]');
      if (iframes.length > 0) {
        console.warn('[NAA Debug] ⚠️ Iframes detected - likely using third-party cookies, NOT NAA');
      } else {
        console.log('[NAA Debug] ✅ No iframes - might be using NAA bridge');
      }
      
      return result;
    } catch (e: any) {
      console.log('[NAA Debug] ssoSilent FAILED -', e.errorCode);
      throw e;
    }
  };
  
  console.groupEnd();
  
  return () => {
    msalInstance.acquireTokenSilent = originalAcquireTokenSilent;
    msalInstance.ssoSilent = originalSsoSilent;
  };
}, [msalInstance]);
*/
