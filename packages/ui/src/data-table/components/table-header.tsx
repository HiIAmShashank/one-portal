/**
 * TableHeader component - Renders table header with column headers
 * @module data-table/components/table-header
 */

import type { Table } from '@tanstack/react-table';
import { ColumnHeader } from './column-header';
import { TableInlineFilters } from './table-inline-filters';
import type { Density, FilterMode } from '../types';

interface TableHeaderProps<TData> {
  table: Table<TData>;
  enableSorting?: boolean;
  enableResizing?: boolean;
  enablePinning?: boolean;
  enableReordering?: boolean;
  enableGrouping?: boolean;
  density?: Density;
  filterMode?: FilterMode;
  enableColumnFilters?: boolean;
  stickyHeader?: boolean;
  stickyColumns?: {
    left?: number;
    right?: number;
  };
}

/**
 * TableHeader - Renders column headers with advanced features
 */
export function TableHeader<TData>({
  table,
  enableSorting = true,
  enableResizing = true,
  enablePinning = true,
  enableReordering = true,
  enableGrouping = false,
  density = 'default',
  filterMode = 'toolbar',
  enableColumnFilters = true,
  stickyHeader = false,
  stickyColumns: _stickyColumns,
}: TableHeaderProps<TData>) {
  const showInlineFilters = enableColumnFilters && filterMode === 'inline';

  // Apply sticky header classes
  const theadClassName = stickyHeader
    ? 'sticky top-0 z-20 border-0 bg-background shadow-sm'
    : 'border-b-muted border-b-1 border-t-muted border-t-1 shadow-sm';

  return (
    <thead className={theadClassName}>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id} className=''>
          {headerGroup.headers.map((header) => (
            <ColumnHeader
              key={header.id}
              header={header}
              enableSorting={enableSorting}
              enableResizing={enableResizing}
              enablePinning={enablePinning}
              enableReordering={enableReordering}
              enableGrouping={enableGrouping}
              density={density}
            />
          ))}
        </tr>
      ))}
      {showInlineFilters && <TableInlineFilters table={table} density={density} />}
    </thead>
  );
}

TableHeader.displayName = 'TableHeader';
