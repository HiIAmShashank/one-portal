// packages/auth/src/utils/index.ts
// Utilities barrel export

export {
  accountToUserProfile,
  getLoginHint,
  getAccessToken,
  hasRole,
  hasAnyRole,
} from './msalHelpers';

export {
  parseAuthError,
  isTransientError,
  getUserFriendlyErrorMessage,
} from './errorHandling';

export {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearAuthStorage,
  setReturnUrl,
  getAndClearReturnUrl,
  isStorageAvailable,
} from './storage';

export {
  formatAuthError,
  type FormattedAuthError,
} from './formatAuthError';

export {
  showAuthError,
  displayFormattedError,
  showAuthPromise,
} from './showAuthError';

export {
  isAuthenticated,
  attemptSilentAuth,
  createRouteGuard,
  isInteractionRequired,
  type RouteGuardConfig,
} from './routeGuard';
