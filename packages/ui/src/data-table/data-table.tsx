/**
 * DataTable - Reusable data table component with advanced features
 * @module data-table
 */

import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
} from '@tanstack/react-table';
import type { DataTableProps, Density, FilterMode } from './types';
import { useTableState } from './hooks/use-table-state';
import { TableHeader } from './components/table-header';
import { TableBody } from './components/table-body';
import { TablePagination } from './components/table-pagination';
import { TableToolbar } from './components/table-toolbar';
import { TableRowActions } from './components/table-row-actions';
import { numberRangeFilterFn } from './components/filters/number-range-filter';
import { Checkbox } from '../components/ui/checkbox';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '../lib/utils';

/**
 * Main DataTable component
 * 
 * A highly configurable data table with support for:
 * - Client-side and server-side data
 * - Sorting, filtering, pagination
 * - Column resizing, reordering, pinning
 * - Row selection and bulk actions
 * - Inline editing
 * - Per-row actions
 * - localStorage persistence for column preferences
 * 
 * @example
 * ```tsx
 * <DataTable
 *   tableId="users-table"
 *   data={users}
 *   columns={userColumns}
 *   enableSorting
 *   enableFiltering
 *   enablePagination
 * />
 * ```
 */
export function DataTable<TData>({
  tableId,
  data,
  columns,
  totalCount,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  initialSortingState,
  initialColumnVisibility,
  initialColumnOrder,
  initialColumnSizing,
  initialColumnPinning,
  enableSorting = true,
  enableFiltering = true,
  enableGlobalFilter = true,
  enableColumnFilters = true,
  enableColumnVisibility = true,
  enablePagination = true,
  enableRowSelection = false,
  enableColumnResizing = true,
  enableColumnReordering = true,
  enableColumnPinning = true,
  selectionMode = 'none',
  serverSide = false,
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  errorMessage = 'Error loading data',
  onPaginationChange,
  onSortingChange,
  onFilteringChange,
  onRowSelectionChange,
  enableInlineEditing = false,
  getRowCanEdit,
  onEditCell,
  onColumnOrderChange,
  onColumnPinningChange,
  rowActions,
  bulkActions,
  className,
  variant = 'default',
  // Phase 10: UI Enhancements
  density: densityProp,
  onDensityChange,
  filterMode: filterModeProp,
  onFilterModeChange,
  stickyHeader = false,
  stickyColumns,
  // Phase 10: Row Grouping
  enableGrouping = false,
  initialGrouping,
  onGroupingChange,
  aggregationFns,
  // Phase 10: Row Expanding
  enableExpanding = false,
  initialExpanded,
  onExpandedChange,
  getSubRows,
  renderExpandedRow,
  getRowCanExpand,
}: DataTableProps<TData>) {
  // Manage table state with persistence
  const {
    pagination,
    setPagination: _setPagination,
    sorting,
    setSorting: _setSorting,
    columnFilters,
    setColumnFilters: _setColumnFilters,
    globalFilter,
    setGlobalFilter,
    columnVisibility,
    setColumnVisibility: _setColumnVisibility,
    columnOrder,
    setColumnOrder: _setColumnOrder,
    columnSizing,
    setColumnSizing: _setColumnSizing,
    columnPinning,
    setColumnPinning: _setColumnPinning,
    rowSelection,
    setRowSelection: _setRowSelection,
    // Phase 10: UI Enhancements
    density,
    setDensity,
    filterMode,
    setFilterMode,
    // Phase 10: Row Grouping
    grouping,
    setGrouping: _setGrouping,
    // Phase 10: Row Expanding
    expanded,
    setExpanded: _setExpanded,
    // resetState, // TODO: Will be used for reset button
    // resetColumnPreferences, // TODO: Will be used for column reset
  } = useTableState({
    tableId,
    columns,
    initialPageSize,
    initialSortingState,
    initialColumnVisibility,
    initialColumnOrder,
    initialColumnSizing,
    initialColumnPinning,
    initialGrouping,
    initialExpanded,
    enablePersistence: true,
    onGroupingChange,
    onExpandedChange,
  });

  // Phase 10: Controlled/uncontrolled pattern for density and filterMode
  const actualDensity = densityProp ?? density;
  const handleDensityChange = React.useCallback(
    (newDensity: Density) => {
      setDensity(newDensity);
      onDensityChange?.(newDensity);
    },
    [setDensity, onDensityChange]
  );

  const actualFilterMode = filterModeProp ?? filterMode;
  const handleFilterModeChange = React.useCallback(
    (newFilterMode: FilterMode) => {
      setFilterMode(newFilterMode);
      onFilterModeChange?.(newFilterMode);
    },
    [setFilterMode, onFilterModeChange]
  );

  // FIX: Wrap setPagination to prevent unnecessary state updates when values haven't changed
  const setPagination = React.useCallback((updaterOrValue: any) => {
    _setPagination(prev => {
      const next = typeof updaterOrValue === 'function'
        ? updaterOrValue(prev)
        : updaterOrValue;

      // Only update if values actually changed
      if (prev.pageIndex === next.pageIndex && prev.pageSize === next.pageSize) {
        return prev; // Same reference = no state change = no re-render
      }

      return next;
    });
  }, [_setPagination]);

  // FIX: Wrap setSorting to prevent unnecessary state updates
  const setSorting = React.useCallback((updaterOrValue: any) => {
    _setSorting(prev => {
      const next = typeof updaterOrValue === 'function'
        ? updaterOrValue(prev)
        : updaterOrValue;

      // Deep equality check for array of sort objects
      if (JSON.stringify(prev) === JSON.stringify(next)) {
        return prev;
      }

      return next;
    });
  }, [_setSorting]);

  // FIX: Wrap setColumnFilters to prevent unnecessary state updates when values haven't changed
  const setColumnFilters = React.useCallback((updaterOrValue: any) => {
    _setColumnFilters(prev => {
      const next = typeof updaterOrValue === 'function'
        ? updaterOrValue(prev)
        : updaterOrValue;

      // Only update if values actually changed (deep equality check)
      if (JSON.stringify(prev) === JSON.stringify(next)) {
        return prev; // Same reference = no state change = no re-render
      }

      return next;
    });
  }, [_setColumnFilters]);

  // FIX: Wrap setColumnVisibility to prevent unnecessary state updates
  const setColumnVisibility = React.useCallback((updaterOrValue: any) => {
    _setColumnVisibility(prev => {
      const next = typeof updaterOrValue === 'function'
        ? updaterOrValue(prev)
        : updaterOrValue;

      // Deep equality check for visibility object
      if (JSON.stringify(prev) === JSON.stringify(next)) {
        return prev;
      }

      return next;
    });
  }, [_setColumnVisibility]);

  // FIX: Wrap setColumnOrder to prevent unnecessary state updates
  const setColumnOrder = React.useCallback((updaterOrValue: any) => {
    _setColumnOrder(prev => {
      const next = typeof updaterOrValue === 'function'
        ? updaterOrValue(prev)
        : updaterOrValue;

      // Deep equality check for array
      if (JSON.stringify(prev) === JSON.stringify(next)) {
        return prev;
      }

      return next;
    });
  }, [_setColumnOrder]);

  // FIX: Wrap setColumnSizing to prevent unnecessary state updates
  const setColumnSizing = React.useCallback((updaterOrValue: any) => {
    _setColumnSizing(prev => {
      const next = typeof updaterOrValue === 'function'
        ? updaterOrValue(prev)
        : updaterOrValue;

      // Deep equality check for sizing object
      if (JSON.stringify(prev) === JSON.stringify(next)) {
        return prev;
      }

      return next;
    });
  }, [_setColumnSizing]);

  // FIX: Wrap setColumnPinning to prevent unnecessary state updates
  const setColumnPinning = React.useCallback((updaterOrValue: any) => {
    _setColumnPinning(prev => {
      const next = typeof updaterOrValue === 'function'
        ? updaterOrValue(prev)
        : updaterOrValue;

      // Deep equality check for pinning object
      if (JSON.stringify(prev) === JSON.stringify(next)) {
        return prev;
      }

      return next;
    });
  }, [_setColumnPinning]);

  // FIX: Wrap setRowSelection to prevent unnecessary state updates
  const setRowSelection = React.useCallback((updaterOrValue: any) => {
    _setRowSelection(prev => {
      const next = typeof updaterOrValue === 'function'
        ? updaterOrValue(prev)
        : updaterOrValue;

      // Deep equality check for selection object
      if (JSON.stringify(prev) === JSON.stringify(next)) {
        return prev;
      }

      return next;
    });
  }, [_setRowSelection]);

  // Add selection column if row selection enabled
  const columnsWithSelection = React.useMemo(() => {
    if (!enableRowSelection || selectionMode === 'none') {
      return columns;
    }

    // Prepend selection column to the left
    return [
      {
        id: 'select',
        header: ({ table }: any) => (
          selectionMode === 'multiple' ? (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected()
                  ? true
                  : table.getIsSomePageRowsSelected()
                    ? 'indeterminate'
                    : false
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all rows"
            />
          ) : null
        ),
        cell: ({ row }: any) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
        enableSorting: false,
        enableFiltering: false,
        enableResizing: false,
        enablePinning: true, // Can pin to left
        enableHiding: false, // Always visible when selection enabled
        size: 40, // Fixed narrow width
        minSize: 40,
        maxSize: 40,
      },
      ...columns,
    ];
  }, [columns, enableRowSelection, selectionMode]);

  // Add actions column if rowActions provided
  const columnsWithActions = React.useMemo(() => {
    if (!rowActions || rowActions.length === 0) {
      return columnsWithSelection; // Use columns with selection instead of raw columns
    }

    // Append actions column to the end
    return [
      ...columnsWithSelection,
      {
        id: 'actions',
        header: 'Actions',
        cell: (props: any) => (
          <TableRowActions
            row={props.row.original}
            actions={rowActions}
          />
        ),
        enableSorting: false,
        enableFiltering: false,
        enableResizing: false,
        enablePinning: true, // Can pin to right
        enableHiding: false, // Always visible when actions exist
        size: 150, // Fixed width for actions
        minSize: 100,
        maxSize: 200,
      },
    ];
  }, [columnsWithSelection, rowActions]);

  // Initialize TanStack Table
  const table = useReactTable({
    data,
    columns: columnsWithActions as any, // Use columns with actions, Type compatibility with TanStack Table
    filterFns: {
      numberRange: numberRangeFilterFn,
    },
    aggregationFns,
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      columnOrder,
      columnSizing,
      columnPinning,
      rowSelection,
      grouping,
      expanded,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: setRowSelection,
    onGroupingChange: _setGrouping,
    onExpandedChange: _setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting && !serverSide ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering && !serverSide ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination && !serverSide ? getPaginationRowModel() : undefined,
    getGroupedRowModel: enableGrouping ? getGroupedRowModel() : undefined,
    getExpandedRowModel: enableGrouping || enableExpanding ? getExpandedRowModel() : undefined,
    getSubRows,
    getRowCanExpand,
    manualPagination: serverSide,
    manualSorting: serverSide,
    manualFiltering: serverSide,
    enableSorting,
    enableFilters: enableFiltering,
    enableColumnResizing,
    enableRowSelection: enableRowSelection && selectionMode !== 'none',
    enableMultiRowSelection: selectionMode === 'multiple',
    enableGrouping,
    enableExpanding,
    columnResizeMode: 'onChange',
    pageCount: serverSide && totalCount ? Math.ceil(totalCount / pagination.pageSize) : undefined,
  });

  // Get selected rows data for bulk actions
  const selectedRows = React.useMemo(() => {
    if (!enableRowSelection || selectionMode === 'none') {
      return [];
    }
    return table.getSelectedRowModel().rows.map(row => row.original);
  }, [table, enableRowSelection, selectionMode, rowSelection]); // rowSelection in deps to trigger recalc

  // Trigger callbacks when state changes (for server-side mode)
  React.useEffect(() => {
    onPaginationChange?.(pagination);
  }, [pagination, onPaginationChange]);

  React.useEffect(() => {
    onSortingChange?.(sorting);
  }, [sorting, onSortingChange]);

  React.useEffect(() => {
    onFilteringChange?.(columnFilters);
  }, [columnFilters, onFilteringChange]);

  React.useEffect(() => {
    if (enableRowSelection) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
      onRowSelectionChange?.(selectedRows);
    }
  }, [rowSelection, enableRowSelection, table, onRowSelectionChange]);

  React.useEffect(() => {
    onColumnOrderChange?.(columnOrder);
  }, [columnOrder, onColumnOrderChange]);

  React.useEffect(() => {
    onColumnPinningChange?.(columnPinning);
  }, [columnPinning, onColumnPinningChange]);

  // Handle column reordering via drag and drop
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(String(active.id));
      const newIndex = columnOrder.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = [...columnOrder];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, columnOrder[oldIndex]);
        setColumnOrder(newOrder);
      }
    }
  };

  return (
    <div className={cn('data-table w-full p-4', className)} data-variant={variant}>
      {/* Toolbar with filters and column visibility */}
      {enableFiltering && (
        <TableToolbar

          table={table}
          enableFiltering={enableFiltering}
          enableGlobalFilter={enableGlobalFilter}
          enableColumnFilters={enableColumnFilters}
          enableColumnVisibility={enableColumnVisibility}
          enableRowSelection={enableRowSelection}
          enableGrouping={enableGrouping}
          enableExpanding={enableExpanding}
          selectedRows={selectedRows}
          bulkActions={bulkActions}
          density={actualDensity}
          onDensityChange={handleDensityChange}
          filterMode={actualFilterMode}
          onFilterModeChange={handleFilterModeChange}
        />
      )}

      {/* Wrap table with DndContext for column reordering */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={columnOrder}
          strategy={horizontalListSortingStrategy}
        >
          <div
            className={cn(
              "data-table-container overflow-x-auto",
              stickyHeader && "max-h-[600px] overflow-y-auto"
            )}
          >
            <table className="data-table-root w-full caption-bottom text-sm">
              <TableHeader
                table={table}
                enableSorting={enableSorting}
                enableResizing={enableColumnResizing}
                enablePinning={enableColumnPinning}
                enableReordering={enableColumnReordering}
                enableGrouping={enableGrouping}
                density={actualDensity}
                filterMode={actualFilterMode}
                enableColumnFilters={enableColumnFilters}
                stickyHeader={stickyHeader}
                stickyColumns={stickyColumns}
              />
              <TableBody
                table={table}
                loading={loading}
                error={error}
                emptyMessage={emptyMessage}
                errorMessage={errorMessage}
                columnCount={columns.length}
                enableInlineEditing={enableInlineEditing}
                getRowCanEdit={getRowCanEdit}
                onEditCell={onEditCell}
                enableGrouping={enableGrouping}
                enableExpanding={enableExpanding}
                renderExpandedRow={renderExpandedRow}
                density={actualDensity}
              />
            </table>
          </div>

          {/* Mobile: Horizontal scroll indicator */}
          <div className="sm:hidden px-4 py-2 text-xs text-muted-foreground text-center">
            ← Scroll horizontally to view all columns →
          </div>
        </SortableContext>
      </DndContext>

      {enablePagination && (
        <TablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          totalCount={totalCount}
        />
      )}
    </div>
  );
}

DataTable.displayName = 'DataTable';
