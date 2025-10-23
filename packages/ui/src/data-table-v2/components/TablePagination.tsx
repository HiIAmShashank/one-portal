/**
 * TablePagination - Pagination controls for DataTable
 *
 * Displays page info, navigation buttons, and page size selector
 */

import type { Table } from "@tanstack/react-table";
import { cn } from "../../lib/utils";

interface TablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  showPageInfo?: boolean;
  showPageSizeSelector?: boolean;
}

export function TablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  showPageInfo = true,
  showPageSizeSelector = true,
}: TablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();

  // Calculate showing range
  const totalRows = table.getFilteredRowModel().rows.length;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex items-center justify-between gap-4 border-t border-border dark:border-border bg-background dark:bg-background px-4 py-3">
      {/* Left: Page size selector */}
      {showPageSizeSelector && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground dark:text-muted-foreground">
            Rows per page:
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className={cn(
              "rounded-md border border-border dark:border-border",
              "bg-background dark:bg-background",
              "text-sm text-foreground dark:text-foreground",
              "px-2 py-1",
              "focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring",
            )}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Center: Page info */}
      {showPageInfo && totalRows > 0 && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-muted-foreground">
          <span>
            Showing {startRow} to {endRow} of {totalRows} results
          </span>
        </div>
      )}

      {/* Right: Navigation buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!canPreviousPage}
          className={cn(
            "rounded-md border border-border dark:border-border",
            "bg-background dark:bg-background",
            "px-3 py-1 text-sm",
            "hover:bg-muted dark:hover:bg-muted",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors",
          )}
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m11 17-5-5 5-5" />
            <path d="m18 17-5-5 5-5" />
          </svg>
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!canPreviousPage}
          className={cn(
            "rounded-md border border-border dark:border-border",
            "bg-background dark:bg-background",
            "px-3 py-1 text-sm",
            "hover:bg-muted dark:hover:bg-muted",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors",
          )}
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-foreground dark:text-foreground">
            Page {pageIndex + 1} of {pageCount}
          </span>
        </div>

        <button
          onClick={() => table.nextPage()}
          disabled={!canNextPage}
          className={cn(
            "rounded-md border border-border dark:border-border",
            "bg-background dark:bg-background",
            "px-3 py-1 text-sm",
            "hover:bg-muted dark:hover:bg-muted",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors",
          )}
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
        <button
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!canNextPage}
          className={cn(
            "rounded-md border border-border dark:border-border",
            "bg-background dark:bg-background",
            "px-3 py-1 text-sm",
            "hover:bg-muted dark:hover:bg-muted",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors",
          )}
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m13 17 5-5-5-5" />
            <path d="m6 17 5-5-5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
