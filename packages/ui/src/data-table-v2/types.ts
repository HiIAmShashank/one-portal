/**
 * DataTable V2 - Improved Type System
 *
 * Clean, grouped props with full TanStack Table v8 feature exposure
 */

import type * as React from "react";
import type {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ColumnSizingState,
  ColumnPinningState,
  RowSelectionState,
  PaginationState,
  GroupingState,
  ExpandedState,
  Row,
  Column,
  Table,
  AggregationFn,
} from "@tanstack/react-table";

// ============================================================================
// COLUMN DEFINITION
// ============================================================================

/**
 * Simplified column definition
 */
export interface ColumnDef<TData> {
  // Identity
  id: string;
  accessorKey?: keyof TData;
  accessorFn?: (row: TData) => unknown;

  // Display
  header: string | ((props: HeaderContext<TData>) => React.ReactNode);
  cell?: (props: CellContext<TData>) => React.ReactNode;
  footer?: string | ((props: FooterContext<TData>) => React.ReactNode);

  // Sizing
  size?: number;
  minSize?: number;
  maxSize?: number;

  // Features (opt-out)
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableResizing?: boolean;
  enablePinning?: boolean;
  enableHiding?: boolean;
  enableGrouping?: boolean;

  // Sorting
  sortingFn?:
    | "alphanumeric"
    | "datetime"
    | "basic"
    | ((rowA: Row<TData>, rowB: Row<TData>, columnId: string) => number);
  sortDescFirst?: boolean;

  // Filtering (V2: Auto-detected via faceting if not specified)
  filterFn?:
    | "includesString"
    | "equalsString"
    | "betweenNumbers"
    | "inNumberRange"
    | ((row: Row<TData>, columnId: string, filterValue: unknown) => boolean);

  // Aggregation (for grouped rows)
  aggregationFn?:
    | "sum"
    | "min"
    | "max"
    | "extent"
    | "mean"
    | "median"
    | "unique"
    | "uniqueCount"
    | "count"
    | AggregationFn<TData>;
  aggregatedCell?: (props: CellContext<TData>) => React.ReactNode;

  // Meta (extensible)
  meta?: ColumnMeta;
}

/**
 * Column metadata - auto-detected filter config
 */
export interface ColumnMeta {
  // Manual filter config (overrides auto-detection)
  filterVariant?:
    | "text"
    | "number"
    | "number-range"
    | "select"
    | "multi-select"
    | "boolean"
    | "date"
    | "date-range";
  filterOptions?: Array<{ label: string; value: unknown }>;

  // Display
  headerClassName?: string;
  cellClassName?: string;
  footerClassName?: string;
  tooltip?: string;

  // Extensible for custom features
  [key: string]: unknown;
}

// ============================================================================
// MAIN DATATABLE PROPS
// ============================================================================

export interface DataTableProps<TData> {
  // Core data
  data: TData[];
  columns: ColumnDef<TData>[];

  // Feature configuration (grouped)
  features?: FeaturesConfig<TData>;

  // UI configuration (grouped)
  ui?: UIConfig;

  // Persistence configuration (grouped)
  persistence?: PersistenceConfig;

  // Actions configuration (grouped)
  actions?: ActionsConfig<TData>;

  // Callbacks
  onRowClick?: (row: TData) => void;
  onCellClick?: (cell: {
    row: TData;
    columnId: string;
    value: unknown;
  }) => void;

  // Custom state (advanced users)
  state?: Partial<TableState>;
  onStateChange?: (state: Partial<TableState>) => void;

  // Advanced: Full TanStack Table instance access
  onTableReady?: (table: Table<TData>) => void;

  // Styling
  className?: string;
  containerClassName?: string;
}

// ============================================================================
// GROUPED CONFIGURATION OBJECTS
// ============================================================================

/**
 * Features configuration - all table features in one place
 */
export interface FeaturesConfig<TData> {
  // Sorting
  sorting?:
    | boolean
    | {
        enabled: boolean;
        multi?: boolean;
        initialState?: SortingState;
        onChange?: (state: SortingState) => void;
      };

  // Filtering
  filtering?:
    | boolean
    | {
        enabled: boolean;
        mode?: "faceted" | "manual"; // V2: Faceted auto-detects types
        global?: boolean;
        columns?: boolean;
        initialState?: ColumnFiltersState;
        onChange?: (state: ColumnFiltersState) => void;
      };

  // Pagination
  pagination?:
    | boolean
    | {
        enabled: boolean;
        pageSize?: number;
        pageSizeOptions?: number[];
        initialState?: PaginationState;
        onChange?: (state: PaginationState) => void;
      };

  // Row Selection
  selection?: {
    mode: "single" | "multiple";
    pinLeft?: boolean; // Default: true
    getCanSelect?: (row: TData) => boolean;
    onChange?: (rows: TData[]) => void;
  };

  // Column Management
  columns?: {
    visibility?: boolean;
    resizing?: boolean;
    reordering?: boolean;
    pinning?: boolean;
    initialVisibility?: VisibilityState;
    initialSizing?: ColumnSizingState;
    initialPinning?: ColumnPinningState;
    onVisibilityChange?: (state: VisibilityState) => void;
    onSizingChange?: (state: ColumnSizingState) => void;
    onPinningChange?: (state: ColumnPinningState) => void;
  };

  // Row Grouping
  grouping?: {
    enabled: boolean;
    initialState?: GroupingState;
    onChange?: (state: GroupingState) => void;
  };

  // Row Expanding
  expanding?: {
    enabled: boolean;
    getSubRows?: (row: TData) => TData[] | undefined;
    getCanExpand?: (row: Row<TData>) => boolean;
    renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
    initialState?: ExpandedState;
    onChange?: (state: ExpandedState) => void;
  };

  // Virtualization (V2: NEW!)
  virtualization?: {
    enabled: boolean;
    rowHeight?: number | ((row: TData) => number);
    overscan?: number;
  };

  // Server-side mode
  serverSide?: {
    enabled: boolean;
    totalCount: number;
    loading?: boolean;
    error?: Error | null;
    onFetch?: (params: ServerSideParams) => Promise<void>;
  };
}

/**
 * UI configuration - visual settings
 */
export interface UIConfig {
  // Density
  density?: "compact" | "default" | "comfortable";
  onDensityChange?: (density: "compact" | "default" | "comfortable") => void;

  // Variant
  variant?: "default" | "bordered" | "striped";

  // Layout
  stickyHeader?: boolean;
  stickyColumns?: {
    left?: number;
    right?: number;
  };

  // States
  emptyState?: React.ReactNode;
  loadingState?: "skeleton" | "spinner" | React.ReactNode;
  errorState?: React.ReactNode;

  // Messages
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
}

/**
 * Persistence configuration - localStorage
 */
export interface PersistenceConfig {
  key: string; // localStorage key (required if enabled)
  enabled?: boolean; // Default: true
  // What to persist
  include?: Array<
    | "visibility"
    | "sizing"
    | "pinning"
    | "sorting"
    | "filters"
    | "density"
    | "grouping"
  >;
  exclude?: Array<
    | "visibility"
    | "sizing"
    | "pinning"
    | "sorting"
    | "filters"
    | "density"
    | "grouping"
  >;
}

/**
 * Actions configuration - row and bulk actions
 */
export interface ActionsConfig<TData> {
  row?: RowAction<TData>[];
  bulk?: BulkAction<TData>[];
  pinRight?: boolean; // Default: true
}

// ============================================================================
// ACTION TYPES
// ============================================================================

export interface RowAction<TData> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (row: TData) => void | Promise<void>;
  variant?: "default" | "destructive" | "outline" | "ghost";
  disabled?: (row: TData) => boolean;
  hidden?: (row: TData) => boolean;
  tooltip?: string;
}

export interface BulkAction<TData> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (rows: TData[]) => void | Promise<void>;
  variant?: "default" | "destructive" | "outline" | "ghost";
  disabled?: (rows: TData[]) => boolean;
  minSelection?: number;
  maxSelection?: number;
  tooltip?: string;
}

// ============================================================================
// SERVER-SIDE TYPES
// ============================================================================

export interface ServerSideParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, unknown>;
  globalFilter?: string;
}

export interface ServerSideResponse<TData> {
  data: TData[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ============================================================================
// TABLE STATE
// ============================================================================

export interface TableState {
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  columnVisibility: VisibilityState;
  columnSizing: ColumnSizingState;
  columnPinning: ColumnPinningState;
  rowSelection: RowSelectionState;
  grouping: GroupingState;
  expanded: ExpandedState;
}

// ============================================================================
// CONTEXT TYPES (for render props)
// ============================================================================

export interface HeaderContext<TData = unknown> {
  column: Column<TData, unknown>;
  table: Table<TData>;
}

export interface CellContext<TData = unknown> {
  row: Row<TData>;
  column: Column<TData, unknown>;
  getValue: () => unknown;
  table: Table<TData>;
}

export interface FooterContext<TData = unknown> {
  column: Column<TData, unknown>;
  table: Table<TData>;
}

// ============================================================================
// FILTER TYPES (V2: Enhanced with faceting)
// ============================================================================

/**
 * Auto-detected filter metadata (from faceting)
 */
export interface FilterMetadata {
  variant:
    | "text"
    | "number"
    | "number-range"
    | "select"
    | "multi-select"
    | "boolean"
    | "date"
    | "date-range";
  options?: Array<{ label: string; value: unknown; count?: number }>;
  min?: number;
  max?: number;
  uniqueValues?: unknown[];
  totalCount?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract TData type from DataTableProps
 */
export type InferDataType<T> = T extends DataTableProps<infer U> ? U : never;

/**
 * Make specific props required
 */
export type RequireProps<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific props optional
 */
export type OptionalProps<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
