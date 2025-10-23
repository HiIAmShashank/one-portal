import type { ColumnFiltersState } from '../types';

// ============================================================================
// PUBLIC FILTER FUNCTIONS - Use in ColumnDef.filterFn
// ============================================================================

/**
 * Default text filter with case-insensitive substring matching.
 * 
 * Use this for text-based columns where you want to search for partial matches.
 * Empty filter values are treated as "show all".
 * 
 * @example
 * ```tsx
 * const columns: ColumnDef<User>[] = [
 *   {
 *     id: 'name',
 *     header: 'Name',
 *     accessorKey: 'name',
 *     filterFn: defaultTextFilter, // Enables text search
 *   }
 * ]
 * ```
 * 
 * @param value - The cell value to filter
 * @param filterValue - The user's search text input
 * @returns true if the row should be shown, false if filtered out
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
 * Exact match filter for precise value matching.
 * 
 * Use this when you need exact equality instead of substring matching.
 * Useful for IDs, codes, or enum values.
 * 
 * @example
 * ```tsx
 * const columns: ColumnDef<Product>[] = [
 *   {
 *     id: 'category',
 *     header: 'Category',
 *     accessorKey: 'category',
 *     filterFn: exactMatchFilter, // Only show exact category matches
 *   }
 * ]
 * ```
 * 
 * @param value - The cell value
 * @param filterValue - The value to match exactly
 * @returns true if value === filterValue
 */
export function exactMatchFilter(value: any, filterValue: any): boolean {
  if (filterValue === '' || filterValue === null || filterValue === undefined) {
    return true;
  }

  return value === filterValue;
}

/**
 * Number range filter for min/max filtering.
 * 
 * Use this for numeric columns where users can specify a range.
 * Supports min only, max only, or both.
 * 
 * @example
 * ```tsx
 * const columns: ColumnDef<Product>[] = [
 *   {
 *     id: 'price',
 *     header: 'Price',
 *     accessorKey: 'price',
 *     filterFn: numberRangeFilter,
 *     // User can filter with: { min: 10, max: 100 }
 *   }
 * ]
 * ```
 * 
 * @param value - The numeric cell value
 * @param filterValue - Object with optional min and/or max properties
 * @returns true if value is within the specified range
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
 * Date range filter for start/end date filtering.
 * 
 * Use this for date columns where users can specify a date range.
 * Supports start only, end only, or both.
 * 
 * @example
 * ```tsx
 * const columns: ColumnDef<Order>[] = [
 *   {
 *     id: 'orderDate',
 *     header: 'Order Date',
 *     accessorKey: 'orderDate',
 *     filterFn: dateRangeFilter,
 *     // User can filter with: { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
 *   }
 * ]
 * ```
 * 
 * @param value - The date cell value (Date object or date string)
 * @param filterValue - Object with optional start and/or end Date properties
 * @returns true if value is within the specified date range
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
 * Array includes filter for multi-value matching.
 * 
 * Use this for columns that contain arrays or when filtering with multiple allowed values.
 * Returns true if any filter value matches any cell value.
 * 
 * @example
 * ```tsx
 * const columns: ColumnDef<User>[] = [
 *   {
 *     id: 'roles',
 *     header: 'Roles',
 *     accessorKey: 'roles', // roles: ['admin', 'editor']
 *     filterFn: arrayIncludesFilter,
 *     // User can filter with: ['admin', 'viewer']
 *     // Shows users with admin OR viewer roles
 *   }
 * ]
 * ```
 * 
 * @param value - The cell value (can be array or single value)
 * @param filterValue - Array of values to match against
 * @returns true if any filter value is included in cell value (or vice versa)
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
 * Boolean filter for true/false/null filtering.
 * 
 * Use this for boolean columns or columns that should be filtered by truthy/falsy values.
 * Null filter values show all rows.
 * 
 * @example
 * ```tsx
 * const columns: ColumnDef<User>[] = [
 *   {
 *     id: 'active',
 *     header: 'Active',
 *     accessorKey: 'isActive',
 *     filterFn: booleanFilter,
 *     // User can filter with: true, false, or null (show all)
 *   }
 * ]
 * ```
 * 
 * @param value - The cell value (will be coerced to boolean)
 * @param filterValue - Boolean to match, or null to show all
 * @returns true if Boolean(value) === Boolean(filterValue)
 */
export function booleanFilter(value: any, filterValue: boolean | null): boolean {
  if (filterValue === null || filterValue === undefined) {
    return true;
  }

  return Boolean(value) === Boolean(filterValue);
}

// ============================================================================
// INTERNAL FILTER STATE MANAGEMENT - Not exported from package
// ============================================================================

/**
 * @internal
 * Check if any filters are active (not used externally)
 */
export function hasActiveFilters(filters: ColumnFiltersState): boolean {
  return filters.some(
    (f) => f.value !== '' && f.value !== null && f.value !== undefined
  );
}

/**
 * @internal
 * Count active filters (not used externally)
 */
export function getActiveFiltersCount(filters: ColumnFiltersState): number {
  return filters.filter(
    (f) => f.value !== '' && f.value !== null && f.value !== undefined
  ).length;
}

/**
 * @internal
 * Clear all filters (not used externally)
 */
export function clearAllFilters(): ColumnFiltersState {
  return [];
}

/**
 * @internal
 * Remove a specific filter (used internally by updateFilter)
 */
export function removeFilter(
  filters: ColumnFiltersState,
  columnId: string
): ColumnFiltersState {
  return filters.filter((f) => f.id !== columnId);
}

/**
 * @internal
 * Update filter state (not used externally)
 */
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

/**
 * @internal
 * Debounce utility for internal use (used by table-toolbar component)
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
