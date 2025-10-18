/**
 * ColumnHeader component - Advanced column header with resize, sort, and pin controls
 * @module data-table/components/column-header
 */

import * as React from 'react';
import type { Header } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { useSortable } from '@dnd-kit/sortable';
import { ArrowUp, ArrowDown, ChevronsUpDown, GripVertical, Pin, PinOff, Group, Ungroup } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { cn } from '../../lib/utils';
import type { Density } from '../types';

interface ColumnHeaderProps<TData> {
  header: Header<TData, unknown>;
  enableSorting?: boolean;
  enableResizing?: boolean;
  enablePinning?: boolean;
  enableReordering?: boolean;
  enableGrouping?: boolean;
  density?: Density;
}

/**
 * ColumnHeader - Advanced column header with multiple features
 * 
 * Features:
 * - Sorting (click to toggle)
 * - Resizing (drag right edge)
 * - Pinning (left/right/none)
 * - Reordering (drag and drop - requires DndContext)
 */
export function ColumnHeader<TData>({
  header,
  enableSorting = true,
  enableResizing = true,
  enablePinning = true,
  enableReordering = true,
  enableGrouping = false,
  density = 'default',
}: ColumnHeaderProps<TData>) {
  const { column } = header;
  const canSort = enableSorting && column.getCanSort();
  const canPin = enablePinning && column.getCanPin();
  const canResize = enableResizing && column.getCanResize();
  const canGroup = enableGrouping && column.getCanGroup();
  const isSorted = column.getIsSorted();
  const isPinned = column.getIsPinned();
  const isGrouped = column.getIsGrouped();
  const groupedIndex = column.getGroupedIndex();

  // Density classes for header
  const densityClasses: Record<Density, string> = {
    compact: 'px-2 py-1 text-xs',
    default: 'px-3 py-2 text-sm',
    relaxed: 'px-4 py-4 text-base',
  };

  // Resize handler state
  const [isResizing, setIsResizing] = React.useState(false);

  // Sortable setup for drag and drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    disabled: !enableReordering,
  });

  // Convert transform to CSS transform string
  const transformStyle = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : undefined;

  const style = {
    transform: transformStyle,
    transition,
    opacity: isDragging ? 0.5 : 1,
    width: header.getSize(),
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={cn(
        'text-left align-middle font-medium text-muted-foreground text-ellipsis',
        densityClasses[density],
        'relative',
        isResizing && 'cursor-col-resize'
      )}
    >
      <div className="flex items-center gap-2">
        {/* Drag handle for reordering */}
        {enableReordering && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-move opacity-50 hover:opacity-100"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        {/* Header content with sorting */}
        <div
          className={cn(
            'flex items-center gap-2 min-w-0',
            canSort && 'cursor-pointer select-none'
          )}
          onClick={canSort ? column.getToggleSortingHandler() : undefined}
        >
          <span className="font-bold min-w-0 text-ellipsis text-sm overflow-hidden whitespace-nowrap">
            {header.isPlaceholder
              ? null
              : flexRender(column.columnDef.header, header.getContext())
            }
          </span>

          {/* Sort indicator */}
          {canSort && (
            <span className="ml-auto flex-shrink-0">
              {isSorted === 'asc' && <ArrowUp className="h-4 w-4" />}
              {isSorted === 'desc' && <ArrowDown className="h-4 w-4" />}
              {!isSorted && <ChevronsUpDown className="h-4 w-4 opacity-50" />}
            </span>
          )}
        </div>

        {/* Pin control */}
        {canPin && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                {isPinned ? (
                  <Pin className="h-3 w-3" />
                ) : (
                  <PinOff className="h-3 w-3 opacity-50" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2" align="start">
              <div className="flex flex-col gap-1">
                <Button
                  variant={isPinned === 'left' ? 'default' : 'ghost'}
                  size="sm"
                  className="justify-start"
                  onClick={() => column.pin('left')}
                >
                  Pin Left
                </Button>
                <Button
                  variant={isPinned === 'right' ? 'default' : 'ghost'}
                  size="sm"
                  className="justify-start"
                  onClick={() => column.pin('right')}
                >
                  Pin Right
                </Button>
                <Button
                  variant={!isPinned ? 'default' : 'ghost'}
                  size="sm"
                  className="justify-start"
                  onClick={() => column.pin(false)}
                >
                  Unpin
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Group control */}
        {canGroup && (
          <Button
            variant={isGrouped ? 'default' : 'ghost'}
            size="icon"
            className="h-6 w-6"
            onClick={column.getToggleGroupingHandler()}
            title={isGrouped ? `Grouped (position ${groupedIndex})` : 'Click to group'}
          >
            {isGrouped ? (
              <Group className="h-3 w-3" />
            ) : (
              <Ungroup className="h-3 w-3 opacity-50" />
            )}
          </Button>
        )}
      </div>

      {/* Resize handle */}
      {canResize && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          onMouseEnter={() => setIsResizing(true)}
          onMouseLeave={() => setIsResizing(false)}
          className={cn(
            'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none',
            'hover:bg-primary/50',
            column.getIsResizing() && 'bg-primary'
          )}
        />
      )}
    </th>
  );
}

ColumnHeader.displayName = 'ColumnHeader';
