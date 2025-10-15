/**
 * Custom hook for managing table state with persistence
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
  enablePersistence?: boolean;
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
  enablePersistence = true,
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
    const saved = localStorage.getItem(`table-${tableId}-density`);
    return (saved as Density) || 'default';
  });

  const [filterMode, setFilterMode] = useState<FilterMode>(() => {
    if (!enablePersistence) return 'toolbar';
    const saved = localStorage.getItem(`table-${tableId}-filterMode`);
    return (saved as FilterMode) || 'toolbar';
  });

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
    localStorage.setItem(`table-${tableId}-density`, density);
  }, [tableId, density, enablePersistence]);

  // Persist filterMode to localStorage
  useEffect(() => {
    if (!enablePersistence) return;
    localStorage.setItem(`table-${tableId}-filterMode`, filterMode);
  }, [tableId, filterMode, enablePersistence]);

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

    if (enablePersistence) {
      clearTableState(tableId);
      localStorage.removeItem(`table-${tableId}-density`);
      localStorage.removeItem(`table-${tableId}-filterMode`);
    }
  }, [tableId, columns, initialPageSize, enablePersistence]);

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

    // Utilities
    resetState,
    resetColumnPreferences,
  };
}
