import type * as React from 'react';
import type {
  SortingState as TanStackSortingState,
  ColumnFiltersState as TanStackColumnFiltersState,
  VisibilityState as TanStackVisibilityState,
  ColumnSizingState as TanStackColumnSizingState,
  ColumnPinningState as TanStackColumnPinningState,
  RowSelectionState as TanStackRowSelectionState,
  PaginationState as TanStackPaginationState,
  GroupingState as TanStackGroupingState,
  ExpandedState as TanStackExpandedState,
  AggregationFn as TanStackAggregationFn,
  Row,
} from '@tanstack/react-table';

export type EditInputType =
  | 'text'
  | 'number'
  | 'email'
  | 'date'
  | 'textarea'
  | 'select'
  | 'checkbox';

export interface EditComponentProps<TData> {
  value: any;
  onChange: (newValue: any) => void;
  onSave: () => void;
  onCancel: () => void;
  row: TData;
  columnId: string;
}

export interface EditCellParams<TData> {
  row: TData;
  columnId: string;
  newValue: any;
  oldValue: any;
}

export interface DataTableProps<TData> {
  tableId: string;
  data: TData[];
  columns: ColumnDef<TData>[];
  totalCount?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  initialSortingState?: SortingState;
  initialColumnVisibility?: ColumnVisibilityState;
  /** Initial column order */
  initialColumnOrder?: string[];
  /** Initial column sizing */
  initialColumnSizing?: ColumnSizingState;
  /** Initial column pinning */
  initialColumnPinning?: ColumnPinningState;

  // Features
  /** Enable column sorting (default: true) */
  enableSorting?: boolean;
  /** Enable column filtering (default: true) */
  enableFiltering?: boolean;
  /** Enable global search filter (default: true) */
  enableGlobalFilter?: boolean;
  /** Enable column-specific filters (default: true) */
  enableColumnFilters?: boolean;
  /** Enable column visibility toggle (default: true) */
  enableColumnVisibility?: boolean;
  /** Enable pagination (default: true) */
  enablePagination?: boolean;
  /** Enable row selection (default: false) */
  enableRowSelection?: boolean;
  /** Enable column resizing (default: true) */
  enableColumnResizing?: boolean;
  /** Enable drag-drop reordering (default: true) */
  enableColumnReordering?: boolean;
  /** Enable column pinning (default: true) */
  enableColumnPinning?: boolean;

  // Selection Mode
  /** Row selection mode (default: 'none') */
  selectionMode?: 'single' | 'multiple' | 'none';

  // Server-Side Mode
  /** Use server-side operations (default: false) */
  serverSide?: boolean;
  /** Loading state for server-side data */
  loading?: boolean;
  /** Error state for server-side data */
  error?: Error | null;

  // State Messages
  /** Message when no data (default: "No data available") */
  emptyMessage?: string;
  /** Message during loading (default: "Loading...") */
  loadingMessage?: string;
  /** Message on error (default: "Error loading data") */
  errorMessage?: string;

  // Callbacks
  onPaginationChange?: (state: PaginationState) => void;
  onSortingChange?: (state: SortingState) => void;
  onFilteringChange?: (state: ColumnFiltersState) => void;
  onRowSelectionChange?: (rows: TData[]) => void;
  onEditCell?: (params: EditCellParams<TData>) => Promise<void> | void;
  onColumnOrderChange?: (columnIds: string[]) => void;
  onColumnPinningChange?: (pinning: ColumnPinningState) => void;
  onGroupingChange?: (grouping: GroupingState) => void;
  enableInlineEditing?: boolean;
  getRowCanEdit?: (row: TData) => boolean;
  rowActions?: RowAction<TData>[];
  bulkActions?: BulkAction<TData>[];

  // ========================================================================
  // UI State - Controlled/Uncontrolled Pattern
  // ========================================================================

  /**
   * Filter mode - controls how column filters are displayed.
   * 
   * When provided, DataTable operates in **controlled mode** for filter mode.
   * When omitted, DataTable manages filter mode internally (uncontrolled).
   * 
   * Both modes persist to localStorage when tableId is provided.
   * 
   * @default 'inline' (internal state)
   * 
   * @example
   * ```tsx
   * // Uncontrolled (recommended) - DataTable manages state
   * <DataTable tableId="users" data={users} columns={columns} />
   * 
   * // Controlled - You manage state
   * const [filterMode, setFilterMode] = useState<FilterMode>('popover');
   * <DataTable
   *   tableId="users"
   *   data={users}
   *   columns={columns}
   *   filterMode={filterMode}
   *   onFilterModeChange={setFilterMode}
   * />
   * ```
   */
  filterMode?: FilterMode;

  /**
   * Callback when filter mode changes (for controlled mode).
   * 
   * Only needed if you're controlling filterMode externally.
   * 
   * @param mode - The new filter mode value
   */
  onFilterModeChange?: (mode: FilterMode) => void;

  /**
   * Table density - controls row spacing and text size.
   * 
   * When provided, DataTable operates in **controlled mode** for density.
   * When omitted, DataTable manages density internally (uncontrolled).
   * 
   * Both modes persist to localStorage when tableId is provided.
   * 
   * @default 'default' (internal state)
   * 
   * @example
   * ```tsx
   * // Uncontrolled (recommended) - DataTable manages state
   * <DataTable tableId="products" data={products} columns={columns} />
   * 
   * // Controlled - You manage state
   * const [density, setDensity] = useState<Density>('compact');
   * <DataTable
   *   tableId="products"
   *   data={products}
   *   columns={columns}
   *   density={density}
   *   onDensityChange={setDensity}
   * />
   * ```
   */
  density?: Density;

  /**
   * Callback when density changes (for controlled mode).
   * 
   * Only needed if you're controlling density externally.
   * 
   * @param density - The new density value
   */
  onDensityChange?: (density: Density) => void;
  stickyHeader?: boolean;
  stickyColumns?: {
    left?: number;
    right?: number;
  };
  enableGrouping?: boolean;
  initialGrouping?: string[];
  aggregationFns?: Record<string, TanStackAggregationFn<any>>;
  enableExpanding?: boolean;
  initialExpanded?: ExpandedState;
  onExpandedChange?: (expanded: ExpandedState) => void;
  getSubRows?: (row: TData) => TData[] | undefined;
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
  getRowCanExpand?: (row: Row<TData>) => boolean;
  className?: string;
  /** Table variant */
  variant?: 'default' | 'bordered' | 'striped';
}

// ============================================================================
// COLUMN DEFINITION
// ============================================================================

/**
 * Column definition interface
 * @template TData - Type of data objects in the table
 */
export interface ColumnDef<TData> {
  // Identity
  /** Unique column identifier */
  id: string;
  /** Property name in data object */
  accessorKey?: keyof TData;
  /** Custom accessor function */
  accessorFn?: (row: TData) => any;

  // Display
  /** Column header content */
  header: string | ((props: HeaderContext) => React.ReactNode);
  /** Custom cell renderer */
  cell?: (props: CellContext<TData>) => React.ReactNode;
  /** Column footer content */
  footer?: string | ((props: FooterContext) => React.ReactNode);

  // Sizing
  /** Default column width in pixels */
  size?: number;
  /** Minimum width (default: 50) */
  minSize?: number;
  /** Maximum width (default: 500) */
  maxSize?: number;

  // Features
  /** Allow sorting this column (default: true) */
  enableSorting?: boolean;
  /** Allow filtering this column (default: true) */
  enableFiltering?: boolean;
  /** Allow resizing this column (default: true) */
  enableResizing?: boolean;
  /** Allow pinning this column (default: true) */
  enablePinning?: boolean;
  /** Allow hiding this column (default: true) */
  enableHiding?: boolean;

  // Editing
  /** Allow inline editing (default: false) */
  editable?: boolean;
  /** Input type for editing (auto-detected if not provided) */
  editType?: EditInputType;
  /** Options for select dropdown */
  editOptions?: Array<{ label: string; value: string | number }> | string[] | number[];
  /** Props to pass to input/textarea element */
  editProps?: React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  /** Custom edit input component */
  editComponent?: React.ComponentType<EditComponentProps<TData>>;
  /** Validation function (return error message or true) */
  validate?: (value: any, row: TData) => string | true;
  /** Dynamic cell-level editability */
  getCellCanEdit?: (row: TData) => boolean;
  /** Transform value before editing */
  getEditValue?: (value: any) => any;
  /** Transform value before saving */
  setEditValue?: (editValue: any) => any;

  // Filtering
  /** Custom filter function */
  filterFn?: FilterFn<TData>;
  /** Custom filter input component */
  filterComponent?: FilterComponent;

  // Sorting
  /** Custom sort function */
  sortingFn?: SortingFn<TData>;
  /** Start with descending sort */
  sortDescFirst?: boolean;

  // Phase 10: Aggregation (for row grouping)
  /** Aggregation function name ('sum', 'count', 'min', 'max', etc.) or custom function */
  aggregationFn?: string | TanStackAggregationFn<any>;
  /** Custom renderer for aggregated cell values */
  aggregatedCell?: (props: CellContext<TData>) => React.ReactNode;
  /** Enable grouping for this column (default: true) */
  enableGrouping?: boolean;

  // Metadata
  /** Additional metadata */
  meta?: ColumnMeta;
}

/**
 * Column metadata for additional configuration
 */
export interface ColumnMeta {
  headerClassName?: string;
  cellClassName?: string;
  filterPlaceholder?: string;
  tooltip?: string;

  // Filter configuration
  filterVariant?: FilterVariant;
  filterOptions?: FilterOption[];
  filterConfig?: FilterConfig;

  // Phase 10: Aggregation configuration
  /** Aggregation function name or custom function */
  aggregationFn?: string | TanStackAggregationFn<any>;
  /** Custom renderer for aggregated cell */
  aggregatedCell?: (props: CellContext<any>) => React.ReactNode;
  /** Enable grouping for this column (default: true) */
  enableGrouping?: boolean;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export type FilterVariant =
  | 'text'
  | 'select'
  | 'multi-select'
  | 'number'
  | 'number-range'
  | 'date'
  | 'date-range'
  | 'boolean'
  | 'custom';

export interface FilterOption {
  label: string;
  value: string | number | boolean | null;
  disabled?: boolean;
}

export interface FilterConfig {
  // Number config
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;

  // Date config
  minDate?: Date;
  maxDate?: Date;
  format?: string;

  // Multi-select config
  maxSelections?: number;
  searchable?: boolean;
}

// ============================================================================
// CONTEXT TYPES (for render props)
// ============================================================================

export interface HeaderContext {
  column: any;
  table: any;
}

export interface CellContext<TData> {
  row: { original: TData };
  column: any;
  getValue: () => any;
  table: any;
}

export interface FooterContext {
  column: any;
  table: any;
}

// ============================================================================
// TABLE STATE
// ============================================================================

/**
 * Internal table state managed by TanStack Table
 */
export interface TableState {
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  columnVisibility: ColumnVisibilityState;
  columnOrder: string[];
  columnSizing: ColumnSizingState;
  columnPinning: ColumnPinningState;
  rowSelection: RowSelectionState;
}

// Re-export TanStack Table state types
export type PaginationState = TanStackPaginationState;
export type SortingState = TanStackSortingState;
export type ColumnFiltersState = TanStackColumnFiltersState;
export type ColumnVisibilityState = TanStackVisibilityState;
export type ColumnSizingState = TanStackColumnSizingState;
export type ColumnPinningState = TanStackColumnPinningState;
export type RowSelectionState = TanStackRowSelectionState;
export type GroupingState = TanStackGroupingState;
export type ExpandedState = TanStackExpandedState;

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Per-row action button definition
 * @template TData - Type of data objects in the table
 */
export interface RowAction<TData> {
  /** Unique action identifier */
  id: string;
  /** Button label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Action handler */
  onClick: (row: TData) => void | Promise<void>;
  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  /** Conditional disabling */
  disabled?: (row: TData) => boolean;
  /** Conditional hiding */
  hidden?: (row: TData) => boolean;
  /** Hover tooltip */
  tooltip?: string;
}

/**
 * Bulk action button definition for selected rows
 * @template TData - Type of data objects in the table
 */
export interface BulkAction<TData> {
  /** Unique action identifier */
  id: string;
  /** Button label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Action handler receiving all selected rows */
  onClick: (rows: TData[]) => void | Promise<void>;
  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  /** Conditional disabling */
  disabled?: (rows: TData[]) => boolean;
  /** Only show when rows selected (default: true) */
  requiresSelection?: boolean;
  /** Minimum rows required (default: 1) */
  minSelection?: number;
  /** Maximum rows allowed */
  maxSelection?: number;
  /** Hover tooltip */
  tooltip?: string;
}

// ============================================================================
// SERVER-SIDE DATA
// ============================================================================

/**
 * Request parameters sent to server
 */
export interface ServerSideParams {
  /** Current page (1-indexed for server) */
  page: number;
  /** Rows per page */
  pageSize: number;
  /** Column ID to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Column filters as key-value pairs */
  filters?: Record<string, any>;
}

/**
 * Expected response format from server
 * @template TData - Type of data objects in the table
 */
export interface ServerSideResponse<TData> {
  /** Array of data for current page */
  data: TData[];
  /** Total number of records */
  totalCount: number;
  /** Current page (echoed back) */
  page: number;
  /** Page size (echoed back) */
  pageSize: number;
}

// ============================================================================
// LOCALSTORAGE PERSISTENCE
// ============================================================================

/**
 * Data structure saved to localStorage for column preferences
 */
export interface PersistedTableState {
  /** Schema version (for migration) */
  version: string;
  /** Column widths */
  columnSizing: ColumnSizingState;
  /** Column order */
  columnOrder: string[];
  /** Pinned columns */
  columnPinning: ColumnPinningState;
  /** Hidden columns */
  columnVisibility: ColumnVisibilityState;
  /** Last updated timestamp */
  timestamp: number;
}

// ============================================================================
// FUNCTION TYPES
// ============================================================================

/**
 * Custom filter function type
 */
export type FilterFn<TData> = (
  row: TData,
  columnId: string,
  filterValue: any
) => boolean;

/**
 * Custom sorting function type
 */
export type SortingFn<TData> = (rowA: TData, rowB: TData, columnId: string) => number;

/**
 * Custom filter component type
 */
export type FilterComponent = React.ComponentType<{
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
}>;

// ============================================================================
// PHASE 10: UI ENHANCEMENTS
// ============================================================================

/**
 * Filter display mode
 */
export type FilterMode = 'toolbar' | 'inline' | 'hidden';

/**
 * Table density (spacing)
 */
export type Density = 'compact' | 'default' | 'relaxed';


