/**
 * Client-side filter logic utilities
 * @module data-table/utils/filter-utils
 */

import type { ColumnFiltersState } from '../types';

/**
 * Default filter function for text-based filtering
 * Case-insensitive substring matching
 */
export function defaultTextFilter(value: any, filterValue: string): boolean {
  if (filterValue === '' || filterValue === null || filterValue === undefined) {
    return true;
  }

  const stringValue = String(value ?? '').toLowerCase();
  const filterString = String(filterValue).toLowerCase();

  return stringValue.includes(filterString);
}

/**
 * Filter function for exact matching
 */
export function exactMatchFilter(value: any, filterValue: any): boolean {
  if (filterValue === '' || filterValue === null || filterValue === undefined) {
    return true;
  }

  return value === filterValue;
}

/**
 * Filter function for numeric ranges
 */
export function numberRangeFilter(
  value: any,
  filterValue: { min?: number; max?: number }
): boolean {
  if (!filterValue || (filterValue.min === undefined && filterValue.max === undefined)) {
    return true;
  }

  const numValue = Number(value);
  if (isNaN(numValue)) return false;

  if (filterValue.min !== undefined && numValue < filterValue.min) return false;
  if (filterValue.max !== undefined && numValue > filterValue.max) return false;

  return true;
}

/**
 * Filter function for date ranges
 */
export function dateRangeFilter(
  value: any,
  filterValue: { start?: Date; end?: Date }
): boolean {
  if (!filterValue || (!filterValue.start && !filterValue.end)) {
    return true;
  }

  const dateValue = value instanceof Date ? value : new Date(value);
  if (isNaN(dateValue.getTime())) return false;

  if (filterValue.start && dateValue < filterValue.start) return false;
  if (filterValue.end && dateValue > filterValue.end) return false;

  return true;
}

/**
 * Filter function for array/multi-select matching
 */
export function arrayIncludesFilter(value: any, filterValue: any[]): boolean {
  if (!filterValue || filterValue.length === 0) {
    return true;
  }

  if (Array.isArray(value)) {
    return filterValue.some((fv) => value.includes(fv));
  }

  return filterValue.includes(value);
}

/**
 * Filter function for boolean values
 */
export function booleanFilter(value: any, filterValue: boolean | null): boolean {
  if (filterValue === null || filterValue === undefined) {
    return true;
  }

  return Boolean(value) === Boolean(filterValue);
}



/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: ColumnFiltersState): boolean {
  return filters.some(
    (f) => f.value !== '' && f.value !== null && f.value !== undefined
  );
}

/**
 * Get count of active filters
 */
export function getActiveFiltersCount(filters: ColumnFiltersState): number {
  return filters.filter(
    (f) => f.value !== '' && f.value !== null && f.value !== undefined
  ).length;
}

/**
 * Clear all filters
 */
export function clearAllFilters(): ColumnFiltersState {
  return [];
}

/**
 * Remove a specific filter by column ID
 */
export function removeFilter(
  filters: ColumnFiltersState,
  columnId: string
): ColumnFiltersState {
  return filters.filter((f) => f.id !== columnId);
}

/**
 * Update or add a filter
 */
export function updateFilter(
  filters: ColumnFiltersState,
  columnId: string,
  value: any
): ColumnFiltersState {
  const existing = filters.find((f) => f.id === columnId);

  if (value === '' || value === null || value === undefined) {
    // Remove filter if value is empty
    return removeFilter(filters, columnId);
  }

  if (existing) {
    // Update existing filter
    return filters.map((f) => (f.id === columnId ? { ...f, value } : f));
  }

  // Add new filter
  return [...filters, { id: columnId, value }];
}

/**
 * Debounce utility for filter inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
