import type { ColumnFiltersState } from '../types';

/**
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

export function exactMatchFilter(value: any, filterValue: any): boolean {
  if (filterValue === '' || filterValue === null || filterValue === undefined) {
    return true;
  }

  return value === filterValue;
}

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

export function arrayIncludesFilter(value: any, filterValue: any[]): boolean {
  if (!filterValue || filterValue.length === 0) {
    return true;
  }

  if (Array.isArray(value)) {
    return filterValue.some((fv) => value.includes(fv));
  }

  return filterValue.includes(value);
}

export function booleanFilter(value: any, filterValue: boolean | null): boolean {
  if (filterValue === null || filterValue === undefined) {
    return true;
  }

  return Boolean(value) === Boolean(filterValue);
}



export function hasActiveFilters(filters: ColumnFiltersState): boolean {
  return filters.some(
    (f) => f.value !== '' && f.value !== null && f.value !== undefined
  );
}

export function getActiveFiltersCount(filters: ColumnFiltersState): number {
  return filters.filter(
    (f) => f.value !== '' && f.value !== null && f.value !== undefined
  ).length;
}

export function clearAllFilters(): ColumnFiltersState {
  return [];
}

export function removeFilter(
  filters: ColumnFiltersState,
  columnId: string
): ColumnFiltersState {
  return filters.filter((f) => f.id !== columnId);
}

export function updateFilter(
  filters: ColumnFiltersState,
  columnId: string,
  value: any
): ColumnFiltersState {
  const existing = filters.find((f) => f.id === columnId);

  if (value === '' || value === null || value === undefined) {
    return removeFilter(filters, columnId);
  }

  if (existing) {
    return filters.map((f) => (f.id === columnId ? { ...f, value } : f));
  }

  return [...filters, { id: columnId, value }];
}

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
