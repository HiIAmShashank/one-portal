/**
 * DataTable V2 - Main Component
 *
 * Clean, composable data table with smart defaults
 */

import * as React from "react";
import { flexRender } from "@tanstack/react-table";
import { useDataTable } from "./hooks/useDataTable";
import { TablePagination } from "./components/TablePagination";
import { DataTableToolbar } from "./components/DataTableToolbar";
import type { DataTableProps } from "./types";
import { cn } from "../lib/utils";

export function DataTable<TData>(props: DataTableProps<TData>) {
  const {
    data,
    columns,
    features,
    ui,
    persistence: _persistence,
    actions: _actions,
    onRowClick,
    onCellClick,
    state,
    onStateChange,
    onTableReady,
    className,
    containerClassName,
  } = props;

  // Create table instance with smart defaults
  const table = useDataTable({ data, columns, features, state, onStateChange });

  // Expose table instance to parent
  React.useEffect(() => {
    onTableReady?.(table);
  }, [table, onTableReady]);

  // Extract UI config with defaults
  const density = ui?.density || "default";
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
  const showToolbar = ui?.showToolbar !== false && filteringEnabled;
  const showGlobalSearch = ui?.showGlobalSearch !== false;
  const showColumnFilters = ui?.showColumnFilters !== false;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
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
        />
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
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="hover:bg-muted/50 dark:hover:bg-muted/50 transition-colors"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                      className={cn(
                        cellPaddingClasses[density],
                        "text-left align-middle font-medium",
                        "text-muted-foreground dark:text-muted-foreground",
                        "[&:has([role=checkbox])]:pr-0",
                        variantClasses[variant],
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            canSort && "cursor-pointer select-none",
                          )}
                          onClick={
                            canSort
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {canSort && (
                            <div className="flex flex-col">
                              {sorted === "asc" ? (
                                <svg
                                  className="h-4 w-4 text-foreground dark:text-foreground"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m18 15-6-6-6 6" />
                                </svg>
                              ) : sorted === "desc" ? (
                                <svg
                                  className="h-4 w-4 text-foreground dark:text-foreground"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              ) : (
                                <svg
                                  className="h-4 w-4 text-muted-foreground/50 dark:text-muted-foreground/50"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m7 15 5 5 5-5" />
                                  <path d="m7 9 5-5 5 5" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
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
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
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
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
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
}

DataTable.displayName = "DataTable";
