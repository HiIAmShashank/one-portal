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
  density?: Density;
  filterMode?: FilterMode;
  enableColumnFilters?: boolean;
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
  density = 'default',
  filterMode = 'toolbar',
  enableColumnFilters = true,
}: TableHeaderProps<TData>) {
  const showInlineFilters = enableColumnFilters && filterMode === 'inline';

  return (
    <thead className="border-b">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <ColumnHeader
              key={header.id}
              header={header}
              enableSorting={enableSorting}
              enableResizing={enableResizing}
              enablePinning={enablePinning}
              enableReordering={enableReordering}
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
