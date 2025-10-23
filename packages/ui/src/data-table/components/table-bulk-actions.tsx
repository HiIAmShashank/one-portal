/**
 * TableBulkActions - Renders bulk action buttons when rows are selected
 * @module data-table/components
 */

import * as React from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { X } from 'lucide-react';
import type { BulkAction } from '../types';

interface TableBulkActionsProps<TData> {
  /** Selected row data */
  selectedRows: TData[];
  /** Bulk action configurations */
  actions: BulkAction<TData>[];
  /** Callback when selection cleared */
  onClearSelection: () => void;
}

/**
 * Renders bulk action buttons when rows are selected
 * 
 * Features:
 * - Shows selection count
 * - Clear selection button
 * - Action buttons with minSelection/maxSelection validation
 * - Icon + label support
 * - Variant styling
 * - Conditional disabling
 * 
 * @example
 * ```tsx
 * <TableBulkActions
 *   selectedRows={selectedUsers}
 *   actions={[
 *     {
 *       id: 'delete',
 *       label: 'Delete Selected',
 *       variant: 'destructive',
 *       onClick: (rows) => deleteUsers(rows),
 *       minSelection: 1,
 *     },
 *   ]}
 *   onClearSelection={() => table.resetRowSelection()}
 * />
 * ```
 */
export function TableBulkActions<TData>({
  selectedRows,
  actions,
  onClearSelection,
}: TableBulkActionsProps<TData>) {
  // If no rows selected, don't render
  if (selectedRows.length === 0) {
    return null;
  }

  // Filter actions based on requiresSelection
  const visibleActions = React.useMemo(() => {
    return actions.filter(action => {
      // Default requiresSelection to true
      const requiresSelection = action.requiresSelection !== false;
      if (requiresSelection && selectedRows.length === 0) {
        return false;
      }
      return true;
    });
  }, [actions, selectedRows.length]);

  return (
    <div className="flex items-center gap-4 rounded-md border border-border bg-muted/50 px-4 py-3">
      {/* Selection count badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="rounded-sm px-2 py-1">
          {selectedRows.length} selected
        </Badge>
        
        {/* Clear selection button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-7 px-2"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </div>

      {/* Bulk action buttons */}
      <div className="flex items-center gap-2">
        {visibleActions.map(action => {
          // Check validation rules
          const minSelection = action.minSelection || 1;
          const maxSelection = action.maxSelection;
          
          const isDisabledByMin = selectedRows.length < minSelection;
          const isDisabledByMax = maxSelection && selectedRows.length > maxSelection;
          const isDisabledByFunc = action.disabled ? action.disabled(selectedRows) : false;
          const isDisabled = isDisabledByMin || isDisabledByMax || isDisabledByFunc;

          // Handle click
          const handleClick = async () => {
            if (!isDisabled) {
              await action.onClick(selectedRows);
            }
          };

          return (
            <Button
              key={action.id}
              variant={action.variant || 'default'}
              size="sm"
              disabled={isDisabled}
              onClick={handleClick}
              className="h-8"
              aria-label={action.tooltip || action.label}
              title={
                isDisabledByMin
                  ? `Select at least ${minSelection} row${minSelection > 1 ? 's' : ''}`
                  : isDisabledByMax
                  ? `Select at most ${maxSelection} row${maxSelection > 1 ? 's' : ''}`
                  : action.tooltip
              }
            >
              {action.icon && (
                <span className="mr-2" aria-hidden="true">
                  {action.icon}
                </span>
              )}
              <span>{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
