/**
 * Custom hook for managing table state with automatic localStorage persistence.
 * 
 * This is the core state management hook used by the DataTable component.
 * It handles all table state (pagination, sorting, filtering, column configuration)
 * and automatically persists user preferences to localStorage based on the `tableId`.
 * 
 * ## What Gets Persisted
 * 
 * When `enablePersistence` is true (default), the following state is automatically
 * saved to localStorage and restored on mount:
 * 
 * - **Column visibility** - Which columns are hidden/shown
 * - **Column order** - The order of columns (after drag & drop)
 * - **Column sizing** - Custom column widths
 * - **Column pinning** - Columns pinned left or right
 * - **UI density** - Row height (compact/default/comfortable)
 * - **Filter mode** - Where filters appear (toolbar/inline/both)
 * - **Row grouping** - Which columns are grouped
 * - **Expanded rows** - Which grouped rows are expanded
 * 
 * ## What Does NOT Get Persisted
 * 
 * The following state is intentionally NOT persisted (resets on each mount):
 * 
 * - Sorting state
 * - Active filters (column and global)
 * - Pagination (current page, page size)
 * - Row selection
 * 
 * ## localStorage Keys
 * 
 * For a table with `tableId="my-table"`:
 * - `oneportal-datatable-my-table-state` - Main preferences (JSON object)
 * - `table-my-table-density` - UI density (string)
 * - `table-my-table-filterMode` - Filter mode (string)
 * - `table-my-table-grouping` - Grouping state (JSON array)
 * - `table-my-table-expanded` - Expanded state (JSON object)
 * 
 * ## Validation
 * 
 * All persisted state is validated on load to ensure data integrity:
 * - Column IDs are checked against current column definitions
 * - Invalid/missing columns are filtered out
 * - Corrupt or incompatible data is cleared
 * 
 * ## Version Management
 * 
 * Storage includes a version field (currently "1.0.0"). If the version changes
 * in the future, old stored state will be automatically cleared to prevent
 * compatibility issues.
 * 
 * @example Basic usage (internal - used by DataTable)
 * ```tsx
 * const state = useTableState({
 *   tableId: 'users-table',
 *   columns: userColumns,
 *   initialPageSize: 25,
 *   enablePersistence: true,  // default
 * });
 * ```
 * 
 * @example Disabling persistence
 * ```tsx
 * const state = useTableState({
 *   tableId: 'temp-table',
 *   columns: columns,
 *   enablePersistence: false,  // No localStorage
 * });
 * ```
 * 
 * @see `packages/ui/src/data-table/PERSISTENCE.md` for detailed documentation
 * @module data-table/hooks/use-table-state
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  PaginationState,
  SortingState,
  ColumnFiltersState,
  ColumnVisibilityState,
  ColumnSizingState,
  ColumnPinningState,
  RowSelectionState,
  GroupingState,
  ExpandedState,
  ColumnDef,
  PersistedTableState,
  Density,
  FilterMode,
} from '../types';
import {
  loadTableState,
  saveTableState,
  clearTableState,
} from '../utils/storage';
import {
  getDefaultVisibility,
  getDefaultColumnOrder,
  getDefaultColumnSizing,
  validateVisibility,
  validateColumnOrder,
  validateColumnSizing,
  validateColumnPinning,
} from '../utils/column-utils';

export interface UseTableStateProps<TData> {
  tableId: string;
  columns: ColumnDef<TData>[];
  initialPageSize?: number;
  initialSortingState?: SortingState;
  initialColumnVisibility?: ColumnVisibilityState;
  initialColumnOrder?: string[];
  initialColumnSizing?: ColumnSizingState;
  initialColumnPinning?: ColumnPinningState;
  initialGrouping?: GroupingState;
  initialExpanded?: ExpandedState;
  enablePersistence?: boolean;
  onGroupingChange?: (grouping: GroupingState) => void;
  onExpandedChange?: (expanded: ExpandedState) => void;
}

export interface UseTableStateReturn {
  // Pagination
  pagination: PaginationState;
  setPagination: (state: PaginationState | ((prev: PaginationState) => PaginationState)) => void;

  // Sorting
  sorting: SortingState;
  setSorting: (state: SortingState | ((prev: SortingState) => SortingState)) => void;

  // Filtering
  columnFilters: ColumnFiltersState;
  setColumnFilters: (state: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => void;
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;

  // Column Configuration
  columnVisibility: ColumnVisibilityState;
  setColumnVisibility: (state: ColumnVisibilityState | ((prev: ColumnVisibilityState) => ColumnVisibilityState)) => void;
  columnOrder: string[];
  setColumnOrder: (order: string[] | ((prev: string[]) => string[])) => void;
  columnSizing: ColumnSizingState;
  setColumnSizing: (state: ColumnSizingState | ((prev: ColumnSizingState) => ColumnSizingState)) => void;
  columnPinning: ColumnPinningState;
  setColumnPinning: (state: ColumnPinningState | ((prev: ColumnPinningState) => ColumnPinningState)) => void;

  // Row Selection
  rowSelection: RowSelectionState;
  setRowSelection: (state: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;

  // Phase 10: UI Enhancements
  density: Density;
  setDensity: (density: Density | ((prev: Density) => Density)) => void;
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode | ((prev: FilterMode) => FilterMode)) => void;

  // Phase 10: Row Grouping
  grouping: GroupingState;
  setGrouping: (state: GroupingState | ((prev: GroupingState) => GroupingState)) => void;

  // Phase 10: Row Expanding
  expanded: ExpandedState;
  setExpanded: (state: ExpandedState | ((prev: ExpandedState) => ExpandedState)) => void;

  // Utilities
  resetState: () => void;
  resetColumnPreferences: () => void;
}

/**
 * Hook for managing all table state with localStorage persistence
 */
export function useTableState<TData>({
  tableId,
  columns,
  initialPageSize = 10,
  initialSortingState = [],
  initialColumnVisibility,
  initialColumnOrder,
  initialColumnSizing,
  initialColumnPinning,
  initialGrouping,
  initialExpanded,
  enablePersistence = true,
  onGroupingChange,
  onExpandedChange,
}: UseTableStateProps<TData>): UseTableStateReturn {
  // Load persisted state on mount
  const loadPersistedState = useCallback((): PersistedTableState | null => {
    if (!enablePersistence) return null;
    return loadTableState(tableId);
  }, [tableId, enablePersistence]);

  // Initialize state with defaults or persisted values
  const persisted = loadPersistedState();

  // Pagination state (not persisted)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  // Sorting state (not persisted, but can have initial value)
  const [sorting, setSorting] = useState<SortingState>(initialSortingState);

  // Filtering state (not persisted)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>('');

  // Row selection state (not persisted)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Column configuration state (persisted)
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(() => {
    if (persisted?.columnVisibility) {
      return validateVisibility(persisted.columnVisibility, columns);
    }
    if (initialColumnVisibility) {
      return initialColumnVisibility;
    }
    return getDefaultVisibility(columns);
  });

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (persisted?.columnOrder) {
      return validateColumnOrder(persisted.columnOrder, columns);
    }
    if (initialColumnOrder) {
      return initialColumnOrder;
    }
    return getDefaultColumnOrder(columns);
  });

  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => {
    if (persisted?.columnSizing) {
      return validateColumnSizing(persisted.columnSizing, columns);
    }
    if (initialColumnSizing) {
      return initialColumnSizing;
    }
    return getDefaultColumnSizing(columns);
  });

  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(() => {
    if (persisted?.columnPinning) {
      return validateColumnPinning(persisted.columnPinning, columns);
    }
    if (initialColumnPinning) {
      return initialColumnPinning;
    }
    return { left: [], right: [] };
  });

  // Phase 10: UI Enhancements state (persisted)
  const [density, setDensity] = useState<Density>(() => {
    if (!enablePersistence) return 'default';
    const saved = localStorage.getItem(`oneportal:datatable:${tableId}:density`);
    return (saved as Density) || 'default';
  });

  const [filterMode, setFilterMode] = useState<FilterMode>(() => {
    if (!enablePersistence) return 'toolbar';
    const saved = localStorage.getItem(`oneportal:datatable:${tableId}:filterMode`);
    return (saved as FilterMode) || 'toolbar';
  });

  // Phase 10: Row Grouping state (persisted)
  const [grouping, setGroupingInternal] = useState<GroupingState>(() => {
    if (!enablePersistence) return initialGrouping || [];
    const saved = localStorage.getItem(`oneportal:datatable:${tableId}:grouping`);
    if (saved) {
      try {
        return JSON.parse(saved) as GroupingState;
      } catch {
        return initialGrouping || [];
      }
    }
    return initialGrouping || [];
  });

  // Wrapper for setGrouping that calls the callback
  const setGrouping = useCallback((state: GroupingState | ((prev: GroupingState) => GroupingState)) => {
    setGroupingInternal((prev) => {
      const newState = typeof state === 'function' ? state(prev) : state;
      if (onGroupingChange) {
        onGroupingChange(newState);
      }
      return newState;
    });
  }, [onGroupingChange]);

  // Phase 10: Row Expanding state (persisted)
  const [expanded, setExpandedInternal] = useState<ExpandedState>(() => {
    if (!enablePersistence) return initialExpanded || {};
    const saved = localStorage.getItem(`table-${tableId}-expanded`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Handle both true and object forms
        return parsed === true ? true : (parsed as Record<string, boolean>);
      } catch {
        return initialExpanded || {};
      }
    }
    return initialExpanded || {};
  });

  // Wrapper for setExpanded that calls the callback
  const setExpanded = useCallback((state: ExpandedState | ((prev: ExpandedState) => ExpandedState)) => {
    setExpandedInternal((prev) => {
      const newState = typeof state === 'function' ? state(prev) : state;
      if (onExpandedChange) {
        onExpandedChange(newState);
      }
      return newState;
    });
  }, [onExpandedChange]);

  // Persist column preferences to localStorage
  useEffect(() => {
    if (!enablePersistence) return;

    saveTableState(tableId, {
      columnVisibility,
      columnOrder,
      columnSizing,
      columnPinning,
    });
  }, [tableId, columnVisibility, columnOrder, columnSizing, columnPinning, enablePersistence]);

  // Persist density to localStorage
  useEffect(() => {
    if (!enablePersistence) return;
    localStorage.setItem(`oneportal:datatable:${tableId}:density`, density);
  }, [tableId, density, enablePersistence]);

  // Persist filterMode to localStorage
  useEffect(() => {
    if (!enablePersistence) return;
    localStorage.setItem(`oneportal:datatable:${tableId}:filterMode`, filterMode);
  }, [tableId, filterMode, enablePersistence]);

  // Persist grouping to localStorage
  useEffect(() => {
    if (!enablePersistence) return;
    localStorage.setItem(`oneportal:datatable:${tableId}:grouping`, JSON.stringify(grouping));
  }, [tableId, grouping, enablePersistence]);

  // Persist expanded to localStorage
  useEffect(() => {
    if (!enablePersistence) return;
    localStorage.setItem(`oneportal:datatable:${tableId}:expanded`, JSON.stringify(expanded));
  }, [tableId, expanded, enablePersistence]);

  // Reset all state to defaults
  const resetState = useCallback(() => {
    setPagination({ pageIndex: 0, pageSize: initialPageSize });
    setSorting([]);
    setColumnFilters([]);
    setGlobalFilter('');
    setRowSelection({});
    setColumnVisibility(getDefaultVisibility(columns));
    setColumnOrder(getDefaultColumnOrder(columns));
    setColumnSizing(getDefaultColumnSizing(columns));
    setColumnPinning({ left: [], right: [] });
    setDensity('default');
    setFilterMode('toolbar');
    setGrouping([]);
    setExpanded({});

    if (enablePersistence) {
      clearTableState(tableId);
      localStorage.removeItem(`oneportal:datatable:${tableId}:density`);
      localStorage.removeItem(`oneportal:datatable:${tableId}:filterMode`);
      localStorage.removeItem(`oneportal:datatable:${tableId}:grouping`);
      localStorage.removeItem(`oneportal:datatable:${tableId}:expanded`);
    }
  }, [tableId, columns, initialPageSize, enablePersistence, setGrouping, setExpanded]);

  // Reset only column preferences (visibility, order, sizing, pinning)
  const resetColumnPreferences = useCallback(() => {
    setColumnVisibility(getDefaultVisibility(columns));
    setColumnOrder(getDefaultColumnOrder(columns));
    setColumnSizing(getDefaultColumnSizing(columns));
    setColumnPinning({ left: [], right: [] });

    if (enablePersistence) {
      clearTableState(tableId);
    }
  }, [tableId, columns, enablePersistence]);

  return {
    // Pagination
    pagination,
    setPagination,

    // Sorting
    sorting,
    setSorting,

    // Filtering
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,

    // Column Configuration
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    columnSizing,
    setColumnSizing,
    columnPinning,
    setColumnPinning,

    // Row Selection
    rowSelection,
    setRowSelection,

    // Phase 10: UI Enhancements
    density,
    setDensity,
    filterMode,
    setFilterMode,

    // Phase 10: Row Grouping
    grouping,
    setGrouping,

    // Phase 10: Row Expanding
    expanded,
    setExpanded,

    // Utilities
    resetState,
    resetColumnPreferences,
  };
}
