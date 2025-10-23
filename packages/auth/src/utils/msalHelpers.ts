import type { AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import type { UserProfile } from '../types/auth';

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

export function getLoginHint(account: AccountInfo): string {
  return account.username;
}

export function getAccessToken(result: AuthenticationResult): string {
  return result.accessToken;
}

/**
 * Check if account has all required roles
 */
export function hasRole(account: AccountInfo | null, roles: string | string[]): boolean {
  if (!account?.idTokenClaims) return false;

  const accountRoles = (account.idTokenClaims.roles as string[]) || [];
  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  return requiredRoles.every(role => accountRoles.includes(role));
}

/**
 * Check if account has at least one required role
 */
export function hasAnyRole(account: AccountInfo | null, roles: string | string[]): boolean {
  if (!account?.idTokenClaims) return false;

  const accountRoles = (account.idTokenClaims.roles as string[]) || [];
  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  return requiredRoles.some(role => accountRoles.includes(role));
}
