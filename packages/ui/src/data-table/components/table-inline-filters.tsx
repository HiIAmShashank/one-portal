/**
 * TableInlineFilters - Inline filter row below column headers
 * @module data-table/components/table-inline-filters
 */

import type { Table, Column } from '@tanstack/react-table';
import type { FilterVariant, Density } from '../types';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { NumberRangeFilter } from './filters/number-range-filter';
import { useNumberRange } from '../hooks/use-filter-inference';

interface TableInlineFiltersProps<TData> {
  table: Table<TData>;
  density?: Density;
}

/**
 * Renders an inline filter row directly below the table headers.
 * Each filterable column gets its own filter input.
 */
export function TableInlineFilters<TData>({
  table,
  density = 'default',
}: TableInlineFiltersProps<TData>) {
  const headers = table.getFlatHeaders();

  // Density classes for consistent sizing with headers
  const densityClasses: Record<Density, string> = {
    compact: 'px-2 py-1',
    default: 'px-3 py-2',
    relaxed: 'px-4 py-4',
  };

  return (
    <tr className="">
      {headers.map((header) => {
        const column = header.column;
        const canFilter = column.getCanFilter();

        return (
          <th
            key={header.id}
            style={{ width: header.getSize() }}
            className={cn('align-middle', densityClasses[density])}
          >
            {canFilter ? (
              <InlineFilterCell column={column} table={table} density={density} />
            ) : null}
          </th>
        );
      })}
    </tr>
  );
}

interface InlineFilterCellProps<TData> {
  column: Column<TData, unknown>;
  table: Table<TData>;
  density?: Density;
}

function InlineFilterCell<TData>({
  column,
  table,
  density = 'default',
}: InlineFilterCellProps<TData>) {
  const columnDef = column.columnDef as any;
  const meta = columnDef.meta;
  const filterValue = column.getFilterValue();
  const variant = getFilterVariant(column, table);

  // Get number range metadata if needed
  const numberRange = variant === 'number-range' ? useNumberRange(column, table) : null;

  // Smaller input sizes for inline filters
  const inputSize = density === 'compact' ? 'text-xs' : density === 'relaxed' ? 'text-sm' : 'text-xs';

  // Get placeholder
  const placeholder = meta?.filterPlaceholder || 'Filter...';

  // Handle custom filter component
  if (variant === 'custom' && columnDef.filterComponent) {
    const CustomFilter = columnDef.filterComponent;
    return (
      <CustomFilter
        value={filterValue}
        onChange={(value: any) => column.setFilterValue(value)}
        onClear={() => column.setFilterValue(undefined)}
        inline
      />
    );
  }

  // Render based on variant
  switch (variant) {
    case 'select':
      return (
        <div className="flex items-center gap-1">
          <Select
            value={(filterValue as string) || 'all'}
            onValueChange={(value) => column.setFilterValue(value === 'all' ? undefined : value)}
          >
            <SelectTrigger className={cn('h-9 font-light shadow-sm text-xs border-input/50', inputSize)}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className='font-light'>All</SelectItem>
              {(meta?.filterOptions || [])
                .filter((option: any) => {
                  // Filter out empty string values (Radix UI requirement)
                  const value = typeof option === 'object' ? option.value : option;
                  return value !== '' && value !== null && value !== undefined;
                })
                .map((option: any) => {
                  const value = typeof option === 'object' ? option.value : option;
                  const label = typeof option === 'object' ? option.label : String(option);
                  return (
                    <SelectItem
                      key={String(value)}
                      value={String(value)}
                    >
                      {label}
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
          {!!filterValue && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 p-0"
              onClick={() => column.setFilterValue(undefined)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      );

    case 'boolean':
      return (
        <Select

          value={filterValue === undefined ? 'all' : String(filterValue)}
          onValueChange={(value) => {
            if (value === 'all') {
              column.setFilterValue(undefined);
            } else {
              column.setFilterValue(value === 'true');
            }
          }}
        >
          <SelectTrigger className={cn('h-9 font-light shadow-sm text-xs border-input/50', inputSize)}>
            <SelectValue placeholder="All" className='shadow-sm font-light' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className='font-light shadow-sm'>All</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      );

    case 'number-range':
      return (
        <NumberRangeFilter
          value={filterValue as any}
          onChange={(value) => column.setFilterValue(value)}
          onClear={() => column.setFilterValue(undefined)}
          min={numberRange?.min}
          max={numberRange?.max}
          inline
          className={cn('w-full', inputSize)}
        />
      );

    case 'text':
    default:
      return (
        <div className="flex items-center gap-1">
          <Input
            type="text"
            value={(filterValue as string) || ''}
            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
            placeholder={placeholder}
            className={cn('border-input/50 placeholder:text-muted-foreground placeholder:font-light', inputSize)}
          />
          {!!filterValue && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 p-0"
              onClick={() => column.setFilterValue(undefined)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
  }
}

/**
 * Auto-detect filter variant - same logic as ColumnFilters
 */
function getFilterVariant<TData>(
  column: Column<TData, unknown>,
  table: Table<TData>
): FilterVariant {
  const columnDef = column.columnDef as any;
  const meta = columnDef.meta;

  // 1. Explicit variant in meta
  if (meta?.filterVariant) {
    return meta.filterVariant;
  }

  // 2. Custom component
  if (columnDef.filterComponent) {
    return 'custom';
  }

  // 3. Has filter options -> select
  if (meta?.filterOptions && Array.isArray(meta.filterOptions)) {
    return 'select';
  }

  // 4. Auto-detect from data
  const rows = table.getPreFilteredRowModel().rows;
  if (rows.length > 0) {
    const firstValue = rows[0].getValue(column.id);

    if (typeof firstValue === 'boolean') return 'boolean';
    if (typeof firstValue === 'number') return 'number-range';
    if (firstValue instanceof Date) return 'date';
    if (Array.isArray(firstValue)) return 'multi-select';
  }

  // 5. Default to text
  return 'text';
}

TableInlineFilters.displayName = 'TableInlineFilters';
