/**
 * ColumnVisibility component - Show/hide column controls
 * @module data-table/components/column-visibility
 */

import type { Table } from '@tanstack/react-table';
import { Button } from '../../components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Settings2, Columns } from 'lucide-react';
import { Separator } from '../../components/ui/separator';

interface ColumnVisibilityProps<TData> {
  table: Table<TData>;
  /** Render as icon button (for toolbar) or regular button (standalone) */
  variant?: 'icon' | 'button';
}

/**
 * ColumnVisibility - Dropdown to show/hide columns
 */
export function ColumnVisibility<TData>({
  table,
  variant = 'button'
}: ColumnVisibilityProps<TData>) {
  const columns = table.getAllColumns();
  const visibleCount = columns.filter((col) => col.getIsVisible()).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {variant === 'icon' ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Columns className="h-4 w-4" />
            <span className="sr-only">Show/hide columns</span>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Columns ({visibleCount})
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-60" align="end">
        <div className='flex flex-col gap-2'>
          <h4 className="leading-none font-normal">Column visibility</h4>
          <p className="text-muted-foreground text-sm">
            Set the visibility for each column
          </p>
          <Separator />
        </div>

        <div className="flex flex-col gap-2 mt-2 mb-2 overflow-auto">
          {columns
            .filter((column) => column.getCanHide())
            .map((column) => {
              const columnDef = column.columnDef;
              const label =
                typeof columnDef.header === 'string'
                  ? columnDef.header
                  : column.id;

              return (
                <div
                  key={column.id}
                  className="flex items-center justify-between space-x-2"
                >
                  <Label
                    htmlFor={`column-${column.id}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {label}
                  </Label>
                  <Switch
                    id={`column-${column.id}`}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(value)}
                  />
                </div>
              );
            })}
        </div>
        <div className="">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => table.resetColumnVisibility()}
          >
            Reset to Default
          </Button>
        </div>

      </PopoverContent>
    </Popover>
  );
}

ColumnVisibility.displayName = 'ColumnVisibility';
