/**
 * Custom hook for localStorage persistence with validation
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
