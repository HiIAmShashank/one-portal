/**
 * DataTableToolbar - Filter toolbar with global search and column filters
 *
 * Displays filter controls above the table
 */

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { cn } from "../../lib/utils";
import { FacetedFilter } from "./FacetedFilter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalSearch?: boolean;
  columnFilters?: boolean;
  globalSearchPlaceholder?: string;
}

export function DataTableToolbar<TData>({
  table,
  globalSearch = true,
  columnFilters = true,
  globalSearchPlaceholder = "Search all columns...",
}: DataTableToolbarProps<TData>) {
  const globalFilterValue = table.getState().globalFilter;
  const hasFilters =
    table.getState().columnFilters.length > 0 || globalFilterValue;

  return (
    <div className="space-y-4 border-b border-border dark:border-border bg-background dark:bg-background px-4 py-3">
      {/* Global Search */}
      {globalSearch && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={(globalFilterValue as string) ?? ""}
              onChange={(e) =>
                table.setGlobalFilter(e.target.value || undefined)
              }
              placeholder={globalSearchPlaceholder}
              className={cn(
                "h-9 w-full rounded-md border border-border dark:border-border",
                "bg-background dark:bg-background",
                "pl-10 pr-4 py-2 text-sm",
                "text-foreground dark:text-foreground",
                "placeholder:text-muted-foreground dark:placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring",
              )}
            />
          </div>

          {/* Clear All Filters Button */}
          {hasFilters && (
            <button
              onClick={() => {
                table.resetColumnFilters();
                table.setGlobalFilter(undefined);
              }}
              className={cn(
                "h-9 px-4 rounded-md",
                "border border-border dark:border-border",
                "bg-background dark:bg-background",
                "text-sm text-foreground dark:text-foreground",
                "hover:bg-muted dark:hover:bg-muted",
                "transition-colors",
              )}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Column Filters */}
      {columnFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {table
            .getAllColumns()
            .filter(
              (column) =>
                column.getCanFilter() &&
                column.columnDef.enableColumnFilter !== false,
            )
            .map((column) => (
              <FacetedFilter
                key={column.id}
                column={column}
                title={
                  typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id
                }
              />
            ))}
        </div>
      )}
    </div>
  );
}
