// packages/auth/src/utils/index.ts
// Utilities barrel export

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
  isAuthError,
} from './isAuthError';

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
  isAuthenticated,
  attemptSilentAuth,
  createRouteGuard,
  isInteractionRequired,
  type MsalRouteGuardConfig,
} from './routeGuard';

export {
  isEmbeddedMode,
  getAppMode,
  getEmbeddedModeConfig,
  type AppMode,
  type EmbeddedModeConfig,
} from './environment';

export {
  isValidReturnUrl,
  safeRedirect,
  sanitizeReturnUrl,
} from './urlValidation';
