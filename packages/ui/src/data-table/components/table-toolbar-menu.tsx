/**
 * TableToolbarMenu - Dropdown menu for toolbar (mobile view)
 * @module data-table/components/table-toolbar-menu
 */

import { Button } from '../../components/ui/button';
import { 
  Menu,
  Search, 
  SlidersHorizontal, 
  Settings2,
  Check,
} from 'lucide-react';
import type { Density, FilterMode } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

interface TableToolbarMenuProps {
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
}

/**
 * Dropdown menu for toolbar controls (mobile)
 * Visible on mobile (<640px), replaces icon buttons
 * Note: Column visibility is desktop-only (shown as icon button)
 */
export function TableToolbarMenu({
  searchVisible,
  filtersVisible,
  density,
  filterMode,
  onToggleSearch,
  onToggleFilters,
  onCycleDensity,
  enableGlobalFilter = true,
  enableColumnFilters = true,
}: TableToolbarMenuProps) {
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
    <div className="data-table-toolbar-menu flex sm:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Table Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Search */}
          {enableGlobalFilter && (
            <DropdownMenuItem onClick={onToggleSearch}>
              <Search className="mr-2 h-4 w-4" />
              <span className="flex-1">Search</span>
              {searchVisible && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          )}
          
          {/* Filters */}
          {enableColumnFilters && (
            <DropdownMenuItem onClick={onToggleFilters}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <span className="flex-1">Filters ({filterModeLabel})</span>
              {filtersVisible && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          {/* Density */}
          <DropdownMenuItem onClick={onCycleDensity}>
            <Settings2 className="mr-2 h-4 w-4" />
            <span className="flex-1">Density</span>
            <span className="text-xs text-muted-foreground">{densityLabel}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

TableToolbarMenu.displayName = 'TableToolbarMenu';
