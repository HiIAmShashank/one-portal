/**
 * DataTable V2 - Main Component
 *
 * Clean, composable data table with smart defaults
 */

import * as React from "react";
import {
  flexRender,
  type RowSelectionState,
  type ColumnOrderState,
  type ColumnSizingState,
} from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { useDataTable } from "./hooks/useDataTable";
import { TablePagination } from "./components/TablePagination";
import { DataTableToolbar } from "./components/DataTableToolbar";
import { FacetedFilter } from "./components/FacetedFilter";
import { BulkActions } from "./components/BulkActions";
import { ColumnHeaderMenu } from "./components/ColumnHeaderMenu";
import { DraggableColumnHeader } from "./components/DraggableColumnHeader";
import {
  createSelectionColumn,
  createActionsColumn,
} from "./utils/columnUtils";
import type { DataTableProps } from "./types";
import { cn } from "../lib/utils";

export function DataTable<TData>(props: DataTableProps<TData>) {
  const {
    data,
    columns,
    features,
    ui,
    persistence: _persistence,
    actions,
    onRowClick,
    onCellClick,
    state,
    onStateChange,
    onTableReady,
    className,
    containerClassName,
  } = props;

  // Row selection state (internal if not controlled)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Density state (internal if not controlled)
  const [internalDensity, setInternalDensity] = React.useState<
    "compact" | "default" | "comfortable"
  >(ui?.density || "default");

  // Filter mode state (internal if not controlled)
  const [internalFilterMode, setInternalFilterMode] = React.useState<
    "toolbar" | "inline"
  >(ui?.filterMode || "toolbar");

  // Column order state (internal if not controlled)
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);

  // Column sizing state (internal if not controlled)
  const [columnSizing, _setColumnSizing] = React.useState<ColumnSizingState>(
    {},
  );

  // DnD sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  // Handle density changes
  const handleDensityChange = React.useCallback(
    (newDensity: "compact" | "default" | "comfortable") => {
      // If controlled, notify parent
      if (ui?.density !== undefined && ui?.onDensityChange) {
        ui.onDensityChange(newDensity);
      } else {
        // Otherwise update internal state
        setInternalDensity(newDensity);
      }
    },
    [ui?.density, ui?.onDensityChange],
  );

  // Handle filter mode changes
  const handleFilterModeChange = React.useCallback(
    (newMode: "toolbar" | "inline") => {
      // If controlled, notify parent
      if (ui?.filterMode !== undefined && ui?.onFilterModeChange) {
        ui.onFilterModeChange(newMode);
      } else {
        // Otherwise update internal state
        setInternalFilterMode(newMode);
      }
    },
    [ui?.filterMode, ui?.onFilterModeChange],
  );

  // Handle drag end for column reordering
  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);

        const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
        setColumnOrder(newOrder);

        // Notify parent if callback provided
        if (features?.columns?.onOrderChange) {
          features.columns.onOrderChange(newOrder);
        }
      }
    },
    [columnOrder, features?.columns],
  );

  // Current density (controlled or internal)
  const currentDensity = ui?.density ?? internalDensity;

  // Current filter mode (controlled or internal)
  const currentFilterMode = ui?.filterMode ?? internalFilterMode;

  // Build final columns array with selection and actions
  const finalColumns = React.useMemo(() => {
    let cols = [...columns];

    // Prepend selection column if enabled
    if (features?.selection) {
      const selectionCol = createSelectionColumn<TData>({
        mode: features.selection.mode,
      });
      cols = [selectionCol, ...cols];
    }

    // Append actions column if provided
    if (actions?.row && actions.row.length > 0) {
      const actionsCol = createActionsColumn<TData>(actions.row);
      cols = [...cols, actionsCol];
    }

    return cols;
  }, [columns, features?.selection, actions?.row]);

  // Initialize column order from finalColumns or use provided initialOrder
  React.useEffect(() => {
    if (
      features?.columns?.initialOrder &&
      features.columns.initialOrder.length > 0
    ) {
      setColumnOrder(features.columns.initialOrder);
    } else {
      // Initialize with column IDs from finalColumns
      const colIds = finalColumns.map((col) => col.id);
      setColumnOrder(colIds);
    }
  }, [finalColumns, features?.columns?.initialOrder]);

  // Handle row selection changes - this is the state updater for TanStack Table
  const handleRowSelectionChange = React.useCallback(
    (
      updaterOrValue:
        | RowSelectionState
        | ((old: RowSelectionState) => RowSelectionState),
    ) => {
      const newValue =
        typeof updaterOrValue === "function"
          ? updaterOrValue(state?.rowSelection ?? rowSelection)
          : updaterOrValue;

      // If controlled, notify parent via onStateChange
      if (state?.rowSelection !== undefined && onStateChange) {
        onStateChange({ rowSelection: newValue });
      } else {
        // Otherwise update internal state
        setRowSelection(newValue);
      }
    },
    [state?.rowSelection, rowSelection, onStateChange],
  );

  // Enhanced features with row selection updater
  const enhancedFeatures = React.useMemo(() => {
    if (!features?.selection) return features;

    return {
      ...features,
      selection: {
        ...features.selection,
        // Add the state updater - this is what TanStack Table needs
        onRowSelectionChange: handleRowSelectionChange,
      },
    };
  }, [features, handleRowSelectionChange]);

  // Create table instance with smart defaults
  const table = useDataTable({
    data,
    columns: finalColumns,
    features: enhancedFeatures,
    state: {
      ...state,
      // Use controlled state if provided, otherwise internal state
      rowSelection: state?.rowSelection ?? rowSelection,
      columnOrder: state?.columnOrder ?? columnOrder,
      columnSizing: state?.columnSizing ?? columnSizing,
    },
    onStateChange,
  });

  // Expose table instance to parent
  React.useEffect(() => {
    onTableReady?.(table);
  }, [table, onTableReady]);

  // Handle row selection changes
  React.useEffect(() => {
    const currentSelection = table.getState().rowSelection;

    // Update internal state if not controlled
    if (!state?.rowSelection) {
      setRowSelection(currentSelection);
    }

    // Call onChange callback if provided
    if (features?.selection?.onChange) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      features.selection.onChange(selectedRows);
    }
  }, [table.getState().rowSelection, features?.selection, state?.rowSelection]);

  // Extract UI config with defaults
  const density = currentDensity;
  const variant = ui?.variant || "default";
  const stickyHeader = ui?.stickyHeader || false;

  // Density classes
  const densityClasses = {
    compact: "text-xs",
    default: "text-sm",
    comfortable: "text-base",
  };

  const cellPaddingClasses = {
    compact: "px-2 py-1",
    default: "px-4 py-2",
    comfortable: "px-6 py-4",
  };

  // Variant classes
  const variantClasses = {
    default: "",
    bordered: "border border-border dark:border-border",
    striped: "",
  };

  // Check if table is empty
  const isEmpty = data.length === 0;
  const isLoading = features?.serverSide?.loading;
  const hasError = features?.serverSide?.error;

  // Check if pagination is enabled
  const paginationEnabled = features?.pagination !== false;

  // Check if filtering/toolbar is enabled
  const filteringEnabled = features?.filtering !== false;
  const filterMode = currentFilterMode;
  const showToolbar = ui?.showToolbar !== false && filteringEnabled;
  const showGlobalSearch = ui?.showGlobalSearch !== false;
  const showColumnFilters =
    ui?.showColumnFilters !== false && filterMode === "toolbar";
  const showInlineFilters =
    ui?.showColumnFilters !== false && filterMode === "inline";

  // Check if column reordering is enabled
  const reorderingEnabled = features?.columns?.reordering === true;

  // Get column IDs for DnD (only non-pinned columns can be reordered)
  const columnIds = React.useMemo(
    () => table.getAllLeafColumns().map((col) => col.id),
    [table],
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  const tableContent = (
    <div
      className={cn("w-full", containerClassName)}
      data-density={density}
      data-variant={variant}
    >
      {/* Toolbar with filters */}
      {showToolbar && !isLoading && !hasError && (
        <DataTableToolbar
          table={table}
          globalSearch={showGlobalSearch}
          columnFilters={showColumnFilters}
          globalSearchPlaceholder={ui?.globalSearchPlaceholder}
          showViewOptions={true}
          density={density}
          onDensityChange={handleDensityChange}
          filterMode={filterMode}
          onFilterModeChange={handleFilterModeChange}
        />
      )}

      {/* Bulk Actions */}
      {actions?.bulk && actions.bulk.length > 0 && !isLoading && !hasError && (
        <div className="mb-4">
          <BulkActions table={table} actions={actions.bulk} />
        </div>
      )}

      {/* Table Container */}
      <div
        className={cn(
          "relative w-full",
          "rounded-md border border-border dark:border-border",
          "bg-background dark:bg-background",
          // Only add overflow-auto when NOT in loading state to prevent scrollwheel flicker
          !isLoading && "overflow-auto",
          stickyHeader && "max-h-[600px]",
          className,
        )}
      >
        <table className={cn("w-full caption-bottom", densityClasses[density])}>
          {/* Table Head */}
          <thead
            className={cn(
              "border-b border-border dark:border-border",
              stickyHeader &&
                "sticky top-0 z-20 bg-background dark:bg-background shadow-sm",
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => {
              const headerRow = (
                <tr
                  key={headerGroup.id}
                  className="hover:bg-muted/50 dark:hover:bg-muted/50 transition-colors"
                >
                  {headerGroup.headers.map((header) => {
                    const isPinned = header.column.getIsPinned();
                    const canResize = header.column.getCanResize();
                    const columnDef = header.column.columnDef;
                    const minWidth = columnDef.minSize ?? 80;
                    const maxWidth = columnDef.maxSize ?? 500;

                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          width: `${header.getSize()}px`,
                          minWidth: `${minWidth}px`,
                          maxWidth: `${maxWidth}px`,
                          // Pinning styles
                          position: isPinned ? "sticky" : "relative",
                          left:
                            isPinned === "left"
                              ? `${header.column.getStart("left")}px`
                              : undefined,
                          right:
                            isPinned === "right"
                              ? `${header.column.getAfter("right")}px`
                              : undefined,
                          zIndex: isPinned ? 10 : undefined,
                        }}
                        className={cn(
                          "group", // Add group for hover effects
                          cellPaddingClasses[density],
                          "text-left align-middle font-medium",
                          "text-muted-foreground dark:text-muted-foreground",
                          "[&:has([role=checkbox])]:pr-0",
                          variantClasses[variant],
                          (stickyHeader || isPinned) &&
                            "bg-background dark:bg-background",
                          isPinned && "shadow-md",
                        )}
                      >
                        {header.isPlaceholder ? null : reorderingEnabled &&
                          !isPinned ? (
                          <DraggableColumnHeader header={header}>
                            <div className="space-y-2">
                              <div className="flex items-center gap-1 justify-between relative">
                                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                                  <span className="truncate">
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
                                    )}
                                  </span>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 bg-background dark:bg-background">
                                  <ColumnHeaderMenu
                                    column={header.column}
                                    table={table}
                                    title={
                                      typeof header.column.columnDef.header ===
                                      "string"
                                        ? header.column.columnDef.header
                                        : header.column.id
                                    }
                                    onFilterModeChange={handleFilterModeChange}
                                  />
                                </div>
                              </div>
                              {/* Inline filter */}
                              {showInlineFilters &&
                                header.column.getCanFilter() &&
                                header.column.columnDef.enableColumnFilter !==
                                  false && (
                                  <div
                                    className="min-w-[150px]"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <FacetedFilter
                                      column={header.column}
                                      title={
                                        typeof header.column.columnDef
                                          .header === "string"
                                          ? header.column.columnDef.header
                                          : header.column.id
                                      }
                                      inline={true}
                                    />
                                  </div>
                                )}
                            </div>
                          </DraggableColumnHeader>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1 justify-between relative">
                              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                                <span className="truncate">
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                </span>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 bg-background dark:bg-background">
                                <ColumnHeaderMenu
                                  column={header.column}
                                  table={table}
                                  title={
                                    typeof header.column.columnDef.header ===
                                    "string"
                                      ? header.column.columnDef.header
                                      : header.column.id
                                  }
                                  onFilterModeChange={handleFilterModeChange}
                                />
                              </div>
                            </div>
                            {/* Inline filter */}
                            {showInlineFilters &&
                              header.column.getCanFilter() &&
                              header.column.columnDef.enableColumnFilter !==
                                false && (
                                <div
                                  className="min-w-[150px]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FacetedFilter
                                    column={header.column}
                                    title={
                                      typeof header.column.columnDef.header ===
                                      "string"
                                        ? header.column.columnDef.header
                                        : header.column.id
                                    }
                                    inline={true}
                                  />
                                </div>
                              )}
                          </div>
                        )}
                        {/* Resize handle */}
                        {canResize && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={cn(
                              "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
                              "hover:bg-primary/50 active:bg-primary",
                              header.column.getIsResizing() && "bg-primary",
                            )}
                          />
                        )}
                      </th>
                    );
                  })}
                </tr>
              );

              // Wrap with SortableContext if reordering is enabled
              return reorderingEnabled ? (
                <SortableContext key={headerGroup.id} items={columnIds}>
                  {headerRow}
                </SortableContext>
              ) : (
                headerRow
              );
            })}
          </thead>

          {/* Table Body */}
          <tbody>
            {/* Loading State */}
            {isLoading && (
              <tr>
                <td colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground dark:text-muted-foreground">
                    {/* Better loading spinner - proper SVG */}
                    <svg
                      className="h-6 w-6 animate-spin text-primary dark:text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="text-sm">
                      {ui?.loadingMessage || "Loading..."}
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {/* Error State */}
            {hasError && !isLoading && (
              <tr>
                <td colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-destructive dark:text-destructive">
                    <svg
                      className="h-12 w-12 opacity-50"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="font-medium">
                      {ui?.errorMessage || "Error loading data"}
                    </span>
                    {features?.serverSide?.error && (
                      <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                        {features.serverSide.error.message}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* Empty State */}
            {isEmpty && !isLoading && !hasError && (
              <tr>
                <td colSpan={columns.length} className="h-32 text-center">
                  {ui?.emptyState || (
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground dark:text-muted-foreground">
                      <svg
                        className="h-12 w-12 opacity-20 dark:opacity-20"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <span>{ui?.emptyMessage || "No data available"}</span>
                    </div>
                  )}
                </td>
              </tr>
            )}

            {/* No Results from Filters */}
            {!isEmpty &&
              !isLoading &&
              !hasError &&
              table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground dark:text-muted-foreground">
                      <svg
                        className="h-12 w-12 opacity-20"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 10l4 4m0-4l-4 4"
                        />
                      </svg>
                      <div className="space-y-1">
                        <p className="font-medium">No results found</p>
                        <p className="text-sm">
                          Try adjusting your filters or search terms
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

            {/* Data Rows */}
            {!isLoading &&
              !hasError &&
              !isEmpty &&
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    "border-b border-border dark:border-border transition-colors",
                    "hover:bg-muted/50 dark:hover:bg-muted/50",
                    onRowClick && "cursor-pointer",
                    variant === "striped" &&
                      "even:bg-muted/30 dark:even:bg-muted/20",
                  )}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isPinned = cell.column.getIsPinned();
                    const columnDef = cell.column.columnDef;
                    const minWidth = columnDef.minSize ?? 80;
                    const maxWidth = columnDef.maxSize ?? 500;

                    return (
                      <td
                        key={cell.id}
                        style={{
                          width: `${cell.column.getSize()}px`,
                          minWidth: `${minWidth}px`,
                          maxWidth: `${maxWidth}px`,
                          // Pinning styles
                          position: isPinned ? "sticky" : "relative",
                          left:
                            isPinned === "left"
                              ? `${cell.column.getStart("left")}px`
                              : undefined,
                          right:
                            isPinned === "right"
                              ? `${cell.column.getAfter("right")}px`
                              : undefined,
                          zIndex: isPinned ? 9 : undefined,
                        }}
                        onClick={(e) => {
                          if (onCellClick) {
                            e.stopPropagation();
                            onCellClick({
                              row: row.original,
                              columnId: cell.column.id,
                              value: cell.getValue(),
                            });
                          }
                        }}
                        className={cn(
                          cellPaddingClasses[density],
                          "align-middle",
                          "[&:has([role=checkbox])]:pr-0",
                          variantClasses[variant],
                          isPinned &&
                            "bg-background dark:bg-background shadow-md",
                        )}
                      >
                        <div className="truncate">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {paginationEnabled && !isEmpty && !isLoading && !hasError && (
        <TablePagination
          table={table}
          pageSizeOptions={
            typeof features?.pagination === "object"
              ? features.pagination.pageSizeOptions
              : undefined
          }
          showPageInfo={
            typeof features?.pagination === "object"
              ? features.pagination.showPageInfo
              : true
          }
          showPageSizeSelector={
            typeof features?.pagination === "object"
              ? features.pagination.showPageSizeSelector
              : true
          }
        />
      )}
    </div>
  );

  // Wrap with DndContext if reordering is enabled
  return reorderingEnabled ? (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {tableContent}
    </DndContext>
  ) : (
    tableContent
  );
}

DataTable.displayName = "DataTable";
