import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RemoteApp } from '@one-portal/types';

/**
 * Application State Interface
 */
interface AppState {
  /**
   * Currently active remote application
   */
  activeApp: RemoteApp | null;

  /**
   * Loading state for remote apps
   */
  isLoading: boolean;

  /**
   * Error state for remote app loading
   */
  error: Error | null;

  /**
   * List of available apps from configuration
   */
  availableApps: RemoteApp[];

  /**
   * Actions
   */
  setActiveApp: (app: RemoteApp | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setAvailableApps: (apps: RemoteApp[]) => void;
  clearError: () => void;
}

/**
 * Global application store using Zustand
 * Manages shell state, active remote app, and loading states
 */
export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      activeApp: null,
      isLoading: false,
      error: null,
      availableApps: [],

      // Actions
      setActiveApp: (app) =>
        set({ activeApp: app, error: null }, false, 'setActiveApp'),

      setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),

      setError: (error) =>
        set({ error, isLoading: false }, false, 'setError'),

      setAvailableApps: (apps) =>
        set({ availableApps: apps }, false, 'setAvailableApps'),

      clearError: () => set({ error: null }, false, 'clearError'),
    }),
    { name: 'AppStore' }
  )
);
