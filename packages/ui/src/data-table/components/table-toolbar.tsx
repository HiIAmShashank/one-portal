/**
 * TableToolbar component - Filter controls and toolbar actions
 * @module data-table/components/table-toolbar
 */

import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { X, Search } from 'lucide-react';
import { ColumnFilters } from './filters/column-filters';
import { TableBulkActions } from './table-bulk-actions';
import { TableToolbarIcons } from './table-toolbar-icons';
import { TableToolbarMenu } from './table-toolbar-menu';
import { debounce } from '../utils/filter-utils';
import type { BulkAction, Density, FilterMode } from '../types';

interface TableToolbarProps<TData> {
  table: Table<TData>;
  enableFiltering?: boolean;
  enableGlobalFilter?: boolean;
  enableColumnFilters?: boolean;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  filterPlaceholder?: string;
  selectedRows?: TData[];
  bulkActions?: BulkAction<TData>[];
  
  // Phase 10: New props
  density?: Density;
  onDensityChange?: (density: Density) => void;
  filterMode?: FilterMode;
  onFilterModeChange?: (mode: FilterMode) => void;
}

/**
 * TableToolbar - Renders filter inputs and toolbar actions
 */
export function TableToolbar<TData>({
  table,
  enableFiltering = true,
  enableGlobalFilter = true,
  enableColumnFilters = true,
  enableColumnVisibility = true,
  enableRowSelection = false,
  filterPlaceholder = 'Search...',
  selectedRows = [],
  bulkActions,
  density = 'default',
  onDensityChange,
  filterMode = 'toolbar',
  onFilterModeChange,
}: TableToolbarProps<TData>) {
  const [globalFilterValue, setGlobalFilterValue] = React.useState('');
  
  // Phase 10: Toggle states
  const [searchVisible, setSearchVisible] = React.useState(enableGlobalFilter);
  
  // Derive filtersVisible from filterMode
  const filtersVisible = filterMode !== 'hidden';
  
  // Debounced global filter to avoid too many re-renders
  const debouncedSetGlobalFilter = React.useMemo(
    () => debounce((value: string) => table.setGlobalFilter(value), 300),
    [table]
  );

  const handleGlobalFilterChange = (value: string) => {
    setGlobalFilterValue(value);
    debouncedSetGlobalFilter(value);
  };

  const hasActiveFilters =
    table.getState().columnFilters.length > 0 || !!table.getState().globalFilter;

  const activeColumnFilters = table.getState().columnFilters.length;

  const clearAllFilters = () => {
    table.resetColumnFilters();
    table.resetGlobalFilter();
    setGlobalFilterValue('');
  };

  // Phase 10: Toggle handlers
  const handleToggleSearch = () => {
    setSearchVisible(prev => !prev);
  };

  const handleCycleDensity = () => {
    if (!onDensityChange) return;
    
    const cycle: Record<Density, Density> = {
      compact: 'default',
      default: 'relaxed',
      relaxed: 'compact',
    };
    
    onDensityChange(cycle[density]);
  };

  const handleCycleFilterMode = () => {
    if (!onFilterModeChange) return;
    
    const cycle: Record<FilterMode, FilterMode> = {
      toolbar: 'inline',
      inline: 'hidden',
      hidden: 'toolbar',
    };
    
    onFilterModeChange(cycle[filterMode]);
  };

  if (!enableFiltering && !enableColumnVisibility) {
    return null;
  }

  return (
    <div className="data-table-toolbar border-b">
      {/* Row 1: Icon controls + conditional search */}
      <div className="flex items-center justify-between gap-2 p-2">
        {/* Left: Conditional global search */}
        {searchVisible && enableGlobalFilter && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={filterPlaceholder}
              value={globalFilterValue}
              onChange={(e) => handleGlobalFilterChange(e.target.value)}
              className="pl-9 pr-9 h-8"
            />
            {globalFilterValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => handleGlobalFilterChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Right: Icon buttons (desktop) + Menu (mobile) */}
        <div className="ml-auto flex items-center gap-2">
          {/* Filter indicators */}
          {activeColumnFilters > 0 && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {activeColumnFilters} filter{activeColumnFilters !== 1 ? 's' : ''}
            </Badge>
          )}

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="hidden sm:inline-flex h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}

          {/* Desktop: Icon buttons */}
          <TableToolbarIcons
            table={table}
            searchVisible={searchVisible}
            filtersVisible={filtersVisible}
            density={density}
            filterMode={filterMode}
            onToggleSearch={handleToggleSearch}
            onToggleFilters={handleCycleFilterMode}
            onCycleDensity={handleCycleDensity}
            enableGlobalFilter={enableGlobalFilter}
            enableColumnFilters={enableColumnFilters}
            enableColumnVisibility={enableColumnVisibility}
          />

          {/* Mobile: Dropdown menu */}
          <TableToolbarMenu
            searchVisible={searchVisible}
            filtersVisible={filtersVisible}
            density={density}
            filterMode={filterMode}
            onToggleSearch={handleToggleSearch}
            onToggleFilters={handleCycleFilterMode}
            onCycleDensity={handleCycleDensity}
            enableGlobalFilter={enableGlobalFilter}
            enableColumnFilters={enableColumnFilters}
          />
        </div>
      </div>

      {/* Bulk actions row - shows when rows selected */}
      {enableRowSelection && selectedRows.length > 0 && bulkActions && bulkActions.length > 0 && (
        <div className="px-4 pb-2">
          <TableBulkActions
            selectedRows={selectedRows}
            actions={bulkActions}
            onClearSelection={() => table.resetRowSelection()}
          />
        </div>
      )}

      {/* Row 2: Column filters (toolbar mode only) */}
      {filtersVisible && filterMode === 'toolbar' && enableColumnFilters && enableFiltering && (
        <div className="flex items-start gap-4 flex-wrap px-4 pb-2 border-t">
          <ColumnFilters table={table} />
        </div>
      )}
    </div>
  );
}

TableToolbar.displayName = 'TableToolbar';
