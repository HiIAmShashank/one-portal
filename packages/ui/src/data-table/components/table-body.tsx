/**
 * TableBody component - Renders table body with rows and cells
 * @module data-table/components/table-body
 */

import * as React from 'react';
import type { Table, Row } from '@tanstack/react-table';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TableCell } from './table-cell';
import type { Density } from '../types';

interface TableBodyProps<TData> {
  table: Table<TData>;
  loading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  errorMessage?: string;
  columnCount: number;
  enableInlineEditing?: boolean;
  getRowCanEdit?: (row: TData) => boolean;
  onEditCell?: (params: {
    row: TData;
    columnId: string;
    newValue: any;
    oldValue: any;
  }) => void | Promise<void>;
  enableGrouping?: boolean;
  enableExpanding?: boolean;
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
  density?: Density;
}

/**
 * TableBody - Renders rows and cells with loading, empty, and error states
 */
export function TableBody<TData>({
  table,
  loading = false,
  error,
  emptyMessage = 'No results found.',
  errorMessage = 'Error loading data',
  columnCount = 0,
  enableInlineEditing = false,
  getRowCanEdit,
  onEditCell,
  enableGrouping = false,
  enableExpanding = false,
  renderExpandedRow,
  density = 'default',
}: TableBodyProps<TData>) {
  const rows = table.getRowModel().rows;

  // Loading State
  if (loading) {
    const skeletonRows = 5;
    const visibleColumns = table.getVisibleLeafColumns();

    return (
      <tbody>
        {Array.from({ length: skeletonRows }).map((_, rowIdx) => (
          <tr
            key={`skeleton-row-${rowIdx}`}
            className="border-b transition-colors hover:bg-muted/50"
          >
            {visibleColumns.map((column, colIdx) => {
              const size = column.getSize();
              const isPinned = column.getIsPinned();

              return (
                <td
                  key={`skeleton-cell-${rowIdx}-${colIdx}`}
                  className={cn(
                    'px-4 py-3',
                    isPinned && 'sticky bg-background',
                    isPinned === 'left' && 'left-0 border-r',
                    isPinned === 'right' && 'right-0 border-l'
                  )}
                  style={{
                    width: size !== 150 ? size : undefined,
                    minWidth: size !== 150 ? size : undefined,
                    maxWidth: size !== 150 ? size : undefined,
                  }}
                >
                  <Skeleton className="h-5 w-full" />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    );
  }

  // Error State
  if (error) {
    return (
      <tbody>
        <tr>
          <td colSpan={columnCount} className="px-4 py-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}: {error.message}
              </AlertDescription>
            </Alert>
          </td>
        </tr>
      </tbody>
    );
  }

  // Empty State
  if (rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columnCount} className="px-4 py-12 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-muted p-3">
                <svg
                  className="h-6 w-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  // Data Rows
  return (
    <tbody>
      {rows.map((row) => {
        const isExpanded = row.getIsExpanded();
        const canExpand = row.getCanExpand();

        return (
          <React.Fragment key={row.id}>
            {/* Main Row */}
            <tr
              className={cn(
                'border-b-muted border-b-1 transition-colors hover:bg-muted/50 group/row',
                row.getIsSelected() && 'bg-muted'
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  cell={cell}
                  column={cell.column}
                  row={row}
                  enableInlineEditing={enableInlineEditing}
                  getRowCanEdit={getRowCanEdit}
                  onEditCell={onEditCell}
                  enableGrouping={enableGrouping}
                  enableExpanding={enableExpanding}
                  density={density}
                />
              ))}
            </tr>

            {/* Expanded Row Content */}
            {enableExpanding && isExpanded && renderExpandedRow && (
              <tr className="border-b bg-muted/20">
                <td colSpan={row.getVisibleCells().length} className="p-0">
                  <div className="px-4 py-3">
                    {renderExpandedRow(row)}
                  </div>
                </td>
              </tr>
            )}

            {/* Sub-Rows (hierarchical data) */}
            {enableExpanding && isExpanded && !renderExpandedRow && canExpand && row.subRows && row.subRows.length > 0 && (
              row.subRows.map((subRow) => (
                <tr
                  key={subRow.id}
                  className={cn(
                    'border-b transition-colors hover:bg-muted/50',
                    subRow.getIsSelected() && 'bg-muted'
                  )}
                >
                  {subRow.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      cell={cell}
                      column={cell.column}
                      row={subRow}
                      enableInlineEditing={enableInlineEditing}
                      getRowCanEdit={getRowCanEdit}
                      onEditCell={onEditCell}
                      enableGrouping={enableGrouping}
                      enableExpanding={enableExpanding}
                      density={density}
                    />
                  ))}
                </tr>
              ))
            )}
          </React.Fragment>
        );
      })}
    </tbody>
  );
}

TableBody.displayName = 'TableBody';
