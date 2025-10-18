import type { Table, Column } from '@tanstack/react-table';
import type { FilterVariant } from '../../types';
import { TextFilter } from './text-filter';
import { SelectFilter } from './select-filter';
import { BooleanFilter } from './boolean-filter';

interface ColumnFiltersProps<TData> {
  table: Table<TData>;
}

/**
 * Container component for column-specific filters.
 * Auto-detects filter type based on column configuration and data.
 */
export function ColumnFilters<TData>({ table }: ColumnFiltersProps<TData>) {
  const columns = table.getAllColumns();

  // Only show filters for columns that can be filtered
  const filterableColumns = columns.filter((column) => column.getCanFilter());

  if (filterableColumns.length === 0) {
    return null;
  }

  return (
    <>
      {filterableColumns.map((column) => (
        <ColumnFilter key={column.id} column={column} table={table} />
      ))}
    </>
  );
}

interface ColumnFilterProps<TData> {
  column: Column<TData, unknown>;
  table: Table<TData>;
}

function ColumnFilter<TData>({ column, table }: ColumnFilterProps<TData>) {
  const columnDef = column.columnDef as any;
  const meta = columnDef.meta;
  const filterValue = column.getFilterValue();

  // Get filter variant
  const variant = getFilterVariant(column, table);

  // Get filter label (use header or id)
  const label = typeof columnDef.header === 'string'
    ? columnDef.header
    : column.id;

  // Handle custom filter component
  if (variant === 'custom' && columnDef.filterComponent) {
    const CustomFilter = columnDef.filterComponent;
    return (
      <CustomFilter
        value={filterValue}
        onChange={(value: any) => column.setFilterValue(value)}
        onClear={() => column.setFilterValue(undefined)}
      />
    );
  }

  // Render appropriate filter based on variant
  switch (variant) {
    case 'text':
      return (
        <TextFilter
          label={label}
          value={filterValue as string | undefined}
          onChange={(value) => column.setFilterValue(value)}
          placeholder={meta?.filterPlaceholder}
        />
      );

    case 'select':
      return (

        <SelectFilter
          label={label}
          value={filterValue as string | number | boolean | null | undefined}
          onChange={(value) => column.setFilterValue(value)}
          options={meta?.filterOptions || []}
          placeholder={meta?.filterPlaceholder}
        />
      );

    case 'boolean':
      return (
        <BooleanFilter
          label={label}
          value={filterValue as boolean | undefined}
          onChange={(value) => column.setFilterValue(value)}
        />
      );

    // TODO: Add other filter types (number-range, date, etc.) in Sprint 3
    default:
      return (
        <TextFilter
          label={label}
          value={filterValue as string | undefined}
          onChange={(value) => column.setFilterValue(value)}
          placeholder={meta?.filterPlaceholder}
        />
      );
  }
}

/**
 * Auto-detect filter variant based on column configuration and data.
 * Priority order:
 * 1. Explicit meta.filterVariant
 * 2. Custom filterComponent
 * 3. Has filterOptions -> select
 * 4. Auto-detect from data type
 * 5. Default to text
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

    // Skip empty strings when detecting type
    if (firstValue === '') {
      return 'text';
    }

    if (typeof firstValue === 'boolean') return 'boolean';
    if (typeof firstValue === 'number') return 'number-range';
    if (firstValue instanceof Date) return 'date';
    if (Array.isArray(firstValue)) return 'multi-select';
  }

  // 5. Default to text
  return 'text';
}
