/**
 * DataTable V2 - Public API
 */

// Main component
export { DataTable } from "./DataTable";

// Sub-components (for advanced composition)
export { TablePagination } from "./components/TablePagination";
export { DataTableToolbar } from "./components/DataTableToolbar";
export { FacetedFilter } from "./components/FacetedFilter";

// Types
export type {
  DataTableProps,
  ColumnDef,
  ColumnMeta,
  FeaturesConfig,
  UIConfig,
  PersistenceConfig,
  ActionsConfig,
  RowAction,
  BulkAction,
  ServerSideParams,
  ServerSideResponse,
  TableState,
  HeaderContext,
  CellContext,
  FooterContext,
  FilterMetadata,
  InferDataType,
  RequireProps,
  OptionalProps,
} from "./types";

// Hooks (for advanced usage)
export { useDataTable } from "./hooks/useDataTable";
export { useFaceting } from "./hooks/useFaceting";
export type { FilterVariant, FilterMetadata } from "./hooks/useFaceting";

// Custom filter functions (for advanced usage)
export { customFilterFns } from "./filters/customFilters";
