/**
 * DataTable V2 - Public API
 */

// Main component
export { DataTable } from "./DataTable";

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
