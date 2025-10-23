import type {
  ColumnDef,
  ColumnVisibilityState,
  ColumnPinningState,
  ColumnSizingState,
} from '../types';

// ============================================================================
// INTERNAL COLUMN UTILITIES - Used by useTableState hook
// Not exported from package - these are implementation details
// ============================================================================

/**
 * @internal
 * Get default column visibility based on column definitions.
 * Used internally by useTableState for initialization.
 */
export function getDefaultVisibility<TData>(
  columns: ColumnDef<TData>[]
): ColumnVisibilityState {
  return columns.reduce(
    (acc, col) => {
      acc[col.id] = true;
      return acc;
    },
    {} as ColumnVisibilityState
  );
}

/**
 * @internal
 * Get default column order from column definitions.
 * Used internally by useTableState for initialization.
 */
export function getDefaultColumnOrder<TData>(columns: ColumnDef<TData>[]): string[] {
  return columns.map((col) => col.id);
}

/**
 * @internal
 * Get default column sizing from column definitions.
 * Used internally by useTableState for initialization.
 */
export function getDefaultColumnSizing<TData>(
  columns: ColumnDef<TData>[]
): ColumnSizingState {
  return columns.reduce(
    (acc, col) => {
      if (col.size) {
        acc[col.id] = col.size;
      }
      return acc;
    },
    {} as ColumnSizingState
  );
}

/**
 * @internal
 * Validate persisted column visibility against current column definitions.
 * Removes entries for columns that no longer exist.
 * Used internally by useTableState when loading from localStorage.
 */
export function validateVisibility<TData>(
  visibility: ColumnVisibilityState,
  columns: ColumnDef<TData>[]
): ColumnVisibilityState {
  const validIds = new Set(columns.map((col) => col.id));
  const validated: ColumnVisibilityState = {};

  for (const [id, visible] of Object.entries(visibility)) {
    if (validIds.has(id)) {
      validated[id] = visible;
    }
  }

  return validated;
}

/**
 * @internal
 * Validate persisted column order against current column definitions.
 * Removes columns that no longer exist and adds new columns to the end.
 * Used internally by useTableState when loading from localStorage.
 */
export function validateColumnOrder<TData>(
  order: string[],
  columns: ColumnDef<TData>[]
): string[] {
  const validIds = new Set(columns.map((col) => col.id));
  const filtered = order.filter((id) => validIds.has(id));

  const existingIds = new Set(filtered);
  const missing = columns
    .filter((col) => !existingIds.has(col.id))
    .map((col) => col.id);

  return [...filtered, ...missing];
}

/**
 * @internal
 * Validate persisted column sizing against current column definitions.
 * Ensures values are within min/max bounds defined in columns.
 * Used internally by useTableState when loading from localStorage.
 */
export function validateColumnSizing<TData>(
  sizing: ColumnSizingState,
  columns: ColumnDef<TData>[]
): ColumnSizingState {
  const columnsById = new Map(columns.map((col) => [col.id, col]));
  const validated: ColumnSizingState = {};

  for (const [id, size] of Object.entries(sizing)) {
    const column = columnsById.get(id);
    if (column) {
      const minSize = column.minSize ?? 50;
      const maxSize = column.maxSize ?? 500;
      validated[id] = Math.max(minSize, Math.min(maxSize, size));
    }
  }

  return validated;
}

/**
 * Removes non-existent columns from pinning
 */
export function validateColumnPinning<TData>(
  pinning: ColumnPinningState,
  columns: ColumnDef<TData>[]
): ColumnPinningState {
  const validIds = new Set(columns.map((col) => col.id));

  return {
    left: pinning.left?.filter((id) => validIds.has(id)),
    right: pinning.right?.filter((id) => validIds.has(id)),
  };
}

/**
 * @internal
 * Count visible columns (not currently used).
 */
export function getVisibleColumnsCount(visibility: ColumnVisibilityState): number {
  return Object.values(visibility).filter((v) => v).length;
}

/**
 * @internal
 * Check if a column is pinned and return which side (not currently used).
 */
export function isColumnPinned(
  columnId: string,
  pinning: ColumnPinningState
): 'left' | 'right' | false {
  if (pinning.left?.includes(columnId)) return 'left';
  if (pinning.right?.includes(columnId)) return 'right';
  return false;
}

/**
 * @internal
 * Calculate total width of all columns (not currently used).
 */
export function calculateTotalWidth<TData>(
  columns: ColumnDef<TData>[],
  sizing: ColumnSizingState,
  visibility: ColumnVisibilityState
): number {
  return columns.reduce((total, col) => {
    if (visibility[col.id] === false) return total;
    return total + (sizing[col.id] ?? col.size ?? 150);
  }, 0);
}
