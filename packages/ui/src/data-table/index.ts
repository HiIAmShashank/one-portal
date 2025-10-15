/**
 * DataTable component - Public API exports
 * @module data-table
 */

// Main component
export { DataTable } from './data-table';

// Error boundary
export { 
  DataTableErrorBoundary, 
  useErrorBoundary,
  type ErrorBoundaryFallbackProps 
} from './components/error-boundary';

// Type exports
export type {
  DataTableProps,
  ColumnDef,
  ColumnMeta,
  RowAction,
  BulkAction,
  EditCellParams,
  EditComponentProps,
  EditInputType,
  ServerSideParams,
  ServerSideResponse,
  TableState,
  PaginationState,
  SortingState,
  ColumnFiltersState,
  ColumnVisibilityState,
  ColumnSizingState,
  ColumnPinningState,
  RowSelectionState,
  FilterFn,
  SortingFn,
  FilterComponent,
  HeaderContext,
  CellContext,
  FooterContext,
} from './types';

// Utility exports
export {
  getDefaultVisibility,
  getDefaultColumnOrder,
  getDefaultColumnSizing,
  validateVisibility,
  validateColumnOrder,
  validateColumnSizing,
  validateColumnPinning,
  getVisibleColumnsCount,
  isColumnPinned,
  calculateTotalWidth,
} from './utils/column-utils';

export {
  defaultTextFilter,
  exactMatchFilter,
  numberRangeFilter,
  dateRangeFilter,
  arrayIncludesFilter,
  booleanFilter,
  hasActiveFilters,
  getActiveFiltersCount,
  clearAllFilters,
  removeFilter,
  updateFilter,
  debounce,
} from './utils/filter-utils';

// Hook exports
export { useLocalStorage } from './hooks/use-local-storage';
export { useTableState, type UseTableStateProps, type UseTableStateReturn } from './hooks/use-table-state';
export { 
  useServerData, 
  createServerParams, 
  transformServerResponse,
  type UseServerDataOptions,
  type UseServerDataReturn 
} from './hooks/use-server-data';
