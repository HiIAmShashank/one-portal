/**
 * Token Acquisition Utility
 * 
 * Provides a silent-first pattern for acquiring access tokens using MSAL.
 * Tries acquireTokenSilent first, falls back to interactive methods only when necessary.
 * 
 * Requirements: US3 (FR-008), PF-006
 * Related: specs/002-add-single-sign/research.md R4 (Graph API patterns)
 */

import type { IPublicClientApplication, AccountInfo, SilentRequest, PopupRequest } from '@azure/msal-browser';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

export interface AcquireTokenOptions {
  /** MSAL instance to use for token acquisition */
  msalInstance: IPublicClientApplication;
  /** Account to acquire token for */
  account: AccountInfo;
  /** Scopes to request (e.g., ['User.Read']) */
  scopes: string[];
  /** Whether to force interactive login if silent fails (default: false) */
  forceInteractive?: boolean;
}

export interface TokenResult {
  /** The acquired access token */
  accessToken: string;
  /** Token expiration timestamp */
  expiresOn: Date | null;
  /** Scopes granted in the token */
  scopes: string[];
  /** Account the token was acquired for */
  account: AccountInfo;
  /** Token type (usually 'Bearer') */
  tokenType: string;
}

/**
 * Acquires an access token using silent-first pattern
 * 
 * Flow:
 * 1. Try acquireTokenSilent (cache or refresh token)
 * 2. If InteractionRequiredAuthError and forceInteractive=true, try popup
 * 3. Otherwise throw error for caller to handle
 * 
 * @param options - Token acquisition options
 * @returns Token result with access token and metadata
 * @throws Error if token acquisition fails
 */
export async function acquireToken(options: AcquireTokenOptions): Promise<TokenResult> {
  const { msalInstance, account, scopes, forceInteractive = false } = options;

  // Log attempt in dev mode (FR-010 Telemetry)
  if (import.meta.env.DEV) {
    console.log('[acquireToken] Attempting silent token acquisition', {
      account: account.username,
      scopes,
      timestamp: new Date().toISOString(),
    });
  }

  const silentRequest: SilentRequest = {
    scopes,
    account,
    forceRefresh: false, // Use cache first for performance (PF-006)
  };

  try {
    // STEP 1: Try silent acquisition (preferred path)
    const response = await msalInstance.acquireTokenSilent(silentRequest);

    if (import.meta.env.DEV) {
      console.log('[acquireToken] ✅ Silent token acquisition successful', {
        account: response.account?.username,
        scopes: response.scopes,
        expiresOn: response.expiresOn,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      accessToken: response.accessToken,
      expiresOn: response.expiresOn,
      scopes: response.scopes,
      account: response.account as AccountInfo,
      tokenType: response.tokenType,
    };
  } catch (error) {
    // Check if error requires user interaction
    if (error instanceof InteractionRequiredAuthError) {
      if (import.meta.env.DEV) {
        console.warn('[acquireToken] ⚠️ Interaction required', {
          error: error.message,
          errorCode: error.errorCode,
          forceInteractive,
        });
      }

      // STEP 2: Fallback to interactive if allowed
      if (forceInteractive) {
        return await acquireTokenInteractive(msalInstance, scopes, account);
      }

      // Re-throw for caller to handle (e.g., redirect to sign-in)
      throw new Error(
        `Token acquisition requires user interaction. ${error.message}. ` +
        `Error code: ${error.errorCode}`
      );
    }

    // Log unexpected errors
    if (import.meta.env.DEV) {
      console.error('[acquireToken] ❌ Token acquisition failed', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }

    throw error instanceof Error 
      ? error 
      : new Error('Unknown error during token acquisition');
  }
}

/**
 * Acquires token using interactive popup
 * Only called when silent acquisition fails and forceInteractive=true
 */
async function acquireTokenInteractive(
  msalInstance: IPublicClientApplication,
  scopes: string[],
  account: AccountInfo
): Promise<TokenResult> {
  if (import.meta.env.DEV) {
    console.log('[acquireToken] Starting interactive popup flow', {
      scopes,
      account: account.username,
    });
  }

  const popupRequest: PopupRequest = {
    scopes,
    account,
    prompt: 'select_account', // Let user confirm account
  };

  try {
    const response = await msalInstance.acquireTokenPopup(popupRequest);

    if (import.meta.env.DEV) {
      console.log('[acquireToken] ✅ Interactive token acquisition successful', {
        account: response.account?.username,
        scopes: response.scopes,
        expiresOn: response.expiresOn,
      });
    }

    return {
      accessToken: response.accessToken,
      expiresOn: response.expiresOn,
      scopes: response.scopes,
      account: response.account as AccountInfo,
      tokenType: response.tokenType,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[acquireToken] ❌ Interactive token acquisition failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    throw new Error(
      `Interactive token acquisition failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Validates if a token is still valid (not expired)
 * 
 * @param expiresOn - Token expiration date
 * @param bufferMinutes - Minutes before expiry to consider invalid (default: 5)
 * @returns true if token is still valid
 */
export function isTokenValid(expiresOn: Date | null, bufferMinutes: number = 5): boolean {
  if (!expiresOn) return false;

  const now = new Date();
  const bufferMs = bufferMinutes * 60 * 1000;
  const expiryWithBuffer = new Date(expiresOn.getTime() - bufferMs);

  return now < expiryWithBuffer;
}

/**
 * Gets remaining token lifetime in minutes
 * 
 * @param expiresOn - Token expiration date
 * @returns Minutes until expiry (negative if expired)
 */
export function getTokenLifetimeMinutes(expiresOn: Date | null): number {
  if (!expiresOn) return -1;

  const now = new Date();
  const diffMs = expiresOn.getTime() - now.getTime();
  return Math.floor(diffMs / (60 * 1000));
}
