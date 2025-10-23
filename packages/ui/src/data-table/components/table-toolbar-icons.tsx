/**
 * TableToolbarIcons - Icon button group for toolbar (desktop view)
 * @module data-table/components/table-toolbar-icons
 */

import type { Table } from '@tanstack/react-table';
import { Button } from '../../components/ui/button';
import {
  Search,
  SlidersHorizontal,
  Settings2,
} from 'lucide-react';
import type { Density, FilterMode } from '../types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '../../components/ui/tooltip';
import { ColumnVisibility } from './column-visibility';

interface TableToolbarIconsProps<TData = unknown> {
  // Table instance
  table: Table<TData>;

  // Toggle states
  searchVisible: boolean;
  filtersVisible: boolean;

  // Current states
  density: Density;
  filterMode: FilterMode;

  // Callbacks
  onToggleSearch: () => void;
  onToggleFilters: () => void;
  onCycleDensity: () => void;

  // Feature flags
  enableGlobalFilter?: boolean;
  enableColumnFilters?: boolean;
  enableColumnVisibility?: boolean;
}

/**
 * Icon buttons for toolbar controls (desktop)
 * Hidden on mobile (<640px), replaced by menu
 */
export function TableToolbarIcons<TData = unknown>({
  table,
  searchVisible,
  filtersVisible,
  density,
  filterMode,
  onToggleSearch,
  onToggleFilters,
  onCycleDensity,
  enableGlobalFilter = true,
  enableColumnFilters = true,
  enableColumnVisibility = true,
}: TableToolbarIconsProps<TData>) {
  // Density labels
  const densityLabel = {
    compact: 'Compact',
    default: 'Default',
    relaxed: 'Relaxed',
  }[density];

  // Filter mode labels
  const filterModeLabel = {
    toolbar: 'Toolbar',
    inline: 'Inline',
    hidden: 'Hidden',
  }[filterMode];

  return (
    <TooltipProvider>
      <div className="data-table-toolbar-icons hidden sm:flex items-center gap-1">
        {/* Search Toggle */}
        {enableGlobalFilter && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={searchVisible ? 'default' : 'ghost'}
                size="icon"
                onClick={onToggleSearch}
                className="h-8 w-8"
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Toggle search</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{searchVisible ? 'Hide' : 'Show'} search</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Filters Toggle */}
        {enableColumnFilters && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={filtersVisible ? 'default' : 'ghost'}
                size="icon"
                onClick={onToggleFilters}
                className="h-8 w-8"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle filters</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{filtersVisible ? 'Hide' : 'Show'} filters ({filterModeLabel})</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Column Visibility */}
        {enableColumnVisibility && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ColumnVisibility table={table} variant="icon" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show/hide columns</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Density Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCycleDensity}
              className="h-8 w-8"
            >
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">Change density</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Density: {densityLabel}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

TableToolbarIcons.displayName = 'TableToolbarIcons';
