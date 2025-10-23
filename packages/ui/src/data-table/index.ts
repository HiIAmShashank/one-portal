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
  GroupingState,
  ExpandedState,
  FilterFn,
  SortingFn,
  FilterComponent,
  HeaderContext,
  CellContext,
  FooterContext,
} from './types';

// ============================================================================
// UTILITY EXPORTS - Public API
// ============================================================================

/**
 * Filter Functions
 * 
 * Use these when defining custom filter functions in column definitions.
 * Each filter function follows the signature: (value: any, filterValue: any) => boolean
 * 
 * @example
 * ```tsx
 * const columns: ColumnDef<User>[] = [
 *   {
 *     id: 'name',
 *     header: 'Name',
 *     filterFn: defaultTextFilter, // Case-insensitive text search
 *   },
 *   {
 *     id: 'age',
 *     header: 'Age',
 *     filterFn: numberRangeFilter, // Min/max range filtering
 *   }
 * ]
 * ```
 */
export {
  defaultTextFilter,
  exactMatchFilter,
  numberRangeFilter,
  dateRangeFilter,
  arrayIncludesFilter,
  booleanFilter,
} from './utils/filter-utils';

/**
 * Aggregation Utilities
 * 
 * Use these when enabling row grouping to specify how grouped rows should be aggregated.
 * 
 * @example
 * ```tsx
 * const columns: ColumnDef<Sale>[] = [
 *   {
 *     id: 'revenue',
 *     header: 'Revenue',
 *     enableGrouping: true,
 *     aggregationFn: aggregationFunctions.sum,
 *     aggregatedCell: createAggregatedCellRenderer('sum', '$'),
 *   }
 * ]
 * ```
 */
export {
  aggregationFunctions,
  formatAggregatedValue,
  createAggregatedCellRenderer,
} from './utils/aggregation-utils';

// Hook exports
/**
 * useLocalStorage - General-purpose localStorage hook
 * Use for custom persistence needs outside of DataTable.
 * For DataTable state persistence, use <DataTable tableId="..." /> instead.
 */
export { useLocalStorage } from './hooks/use-local-storage';

/**
 * useTableState - Core DataTable state management hook
 * Handles all table state with automatic localStorage persistence.
 * Used internally by DataTable component. Most users should use <DataTable />
 * component directly rather than this hook.
 */
export { useTableState, type UseTableStateProps, type UseTableStateReturn } from './hooks/use-table-state';

/**
 * useServerData - Server-side data fetching hook
 * Use for DataTable with server-side pagination, sorting, and filtering.
 */
export {
  useServerData,
  createServerParams,
  transformServerResponse,
  type UseServerDataOptions,
  type UseServerDataReturn
} from './hooks/use-server-data';
