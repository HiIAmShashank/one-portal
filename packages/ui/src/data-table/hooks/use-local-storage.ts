/**
 * Generic hook for persisting any value to localStorage with validation.
 * 
 * This is a **general-purpose utility hook** that can be used for custom
 * persistence needs outside of the DataTable component. For DataTable state
 * persistence, use the `DataTable` component with `tableId` prop instead.
 * 
 * ## Use Cases
 * 
 * Use this hook when you need to persist custom state that is NOT related
 * to DataTable:
 * 
 * - User preferences for custom components
 * - Form draft data
 * - UI state for custom panels/widgets
 * - Any other client-side state that needs persistence
 * 
 * **DO NOT use this for DataTable state** - The `DataTable` component handles
 * all persistence automatically via the `tableId` prop.
 * 
 * ## Features
 * 
 * - Automatic JSON serialization/deserialization
 * - Optional validation function for stored values
 * - Graceful handling of localStorage errors
 * - Type-safe API with TypeScript
 * - Lazy initialization for performance
 * 
 * @example Basic usage
 * ```tsx
 * function MyComponent() {
 *   const [theme, setTheme, clearTheme] = useLocalStorage<string>(
 *     'app-theme',
 *     'light'
 *   );
 * 
 *   return (
 *     <div>
 *       <button onClick={() => setTheme('dark')}>Dark Mode</button>
 *       <button onClick={() => setTheme('light')}>Light Mode</button>
 *       <button onClick={clearTheme}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example With validation
 * ```tsx
 * const [settings, setSettings] = useLocalStorage<Settings>(
 *   'user-settings',
 *   defaultSettings,
 *   (stored) => {
 *     // Validate and migrate old settings
 *     return {
 *       ...defaultSettings,
 *       ...stored,
 *       version: CURRENT_VERSION,
 *     };
 *   }
 * );
 * ```
 * 
 * @example Complex state
 * ```tsx
 * interface PanelState {
 *   isOpen: boolean;
 *   width: number;
 *   position: 'left' | 'right';
 * }
 * 
 * const [panelState, setPanelState] = useLocalStorage<PanelState>(
 *   'sidebar-panel',
 *   { isOpen: false, width: 300, position: 'left' }
 * );
 * ```
 * 
 * @param key - localStorage key (should be unique and descriptive)
 * @param initialValue - Default value if nothing is stored
 * @param validate - Optional validation/migration function for stored values
 * @returns Tuple of [value, setValue, clearValue]
 * 
 * @see For DataTable persistence, use `<DataTable tableId="..." />` instead
 * @module data-table/hooks/use-local-storage
 */

import { useState, useEffect, useCallback } from 'react';
import { isStorageAvailable } from '../utils/storage';

/**
 * Hook for persisting column preferences to localStorage
 * @param key - localStorage key
 * @param initialValue - Default value if nothing is stored
 * @param validate - Optional validation function for stored values
 * @returns [value, setValue, clearValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validate?: (value: T) => T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Check if localStorage is available
  const storageAvailable = isStorageAvailable();

  // Initialize state with stored value or initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!storageAvailable) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item) as T;
        return validate ? validate(parsed) : parsed;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }

    return initialValue;
  });

  // Update localStorage when value changes
  useEffect(() => {
    if (!storageAvailable) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, storedValue, storageAvailable]);

  // Setter function that works like useState
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        const validatedValue = validate ? validate(valueToStore) : valueToStore;
        setStoredValue(validatedValue);
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, validate]
  );

  // Clear function to reset to initial value
  const clearValue = useCallback(() => {
    try {
      if (storageAvailable) {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error clearing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, storageAvailable]);

  return [storedValue, setValue, clearValue];
}
