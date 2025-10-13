// packages/auth/src/utils/msalHelpers.ts
// Helper utilities for MSAL operations

import type { AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import type { UserProfile } from '../types/auth';

/**
 * Extract user profile from MSAL account info
 * @param account - MSAL account information
 * @returns Simplified user profile for UI display
 */
export function accountToUserProfile(account: AccountInfo): UserProfile {
  return {
    id: account.homeAccountId,
    email: account.username,
    name: account.name || account.username,
    roles: (account.idTokenClaims?.roles as string[]) || undefined,
    groups: (account.idTokenClaims?.groups as string[]) || undefined,
    tenantId: account.tenantId,
  };
}

/**
 * Extract login hint (UPN) from account for silent SSO
 * @param account - MSAL account information
 * @returns Login hint string (typically UPN/email)
 */
export function getLoginHint(account: AccountInfo): string {
  return account.username;
}

/**
 * Extract access token from authentication result
 * @param result - MSAL authentication result
 * @returns Access token string
 */
export function getAccessToken(result: AuthenticationResult): string {
  return result.accessToken;
}

/**
 * Check if account has required role(s)
 * @param account - MSAL account information
 * @param roles - Required role(s) - single string or array
 * @returns True if account has all required roles
 */
export function hasRole(account: AccountInfo | null, roles: string | string[]): boolean {
  if (!account?.idTokenClaims) return false;
  
  const accountRoles = (account.idTokenClaims.roles as string[]) || [];
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  
  return requiredRoles.every(role => accountRoles.includes(role));
}

/**
 * Check if account has any of the required roles
 * @param account - MSAL account information
 * @param roles - Required role(s) - single string or array
 * @returns True if account has at least one required role
 */
export function hasAnyRole(account: AccountInfo | null, roles: string | string[]): boolean {
  if (!account?.idTokenClaims) return false;
  
  const accountRoles = (account.idTokenClaims.roles as string[]) || [];
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  
  return requiredRoles.some(role => accountRoles.includes(role));
}
