import type {
  ColumnDef,
  ColumnVisibilityState,
  ColumnPinningState,
  ColumnSizingState,
} from '../types';

/**
 * All columns visible by default unless explicitly hidden
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

export function getDefaultColumnOrder<TData>(columns: ColumnDef<TData>[]): string[] {
  return columns.map((col) => col.id);
}

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
 * Removes entries for non-existent columns
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
 * Removes non-existent columns, adds missing ones
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
 * Ensures values are within min/max bounds
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

export function getVisibleColumnsCount(visibility: ColumnVisibilityState): number {
  return Object.values(visibility).filter((v) => v).length;
}

export function isColumnPinned(
  columnId: string,
  pinning: ColumnPinningState
): 'left' | 'right' | false {
  if (pinning.left?.includes(columnId)) return 'left';
  if (pinning.right?.includes(columnId)) return 'right';
  return false;
}

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
