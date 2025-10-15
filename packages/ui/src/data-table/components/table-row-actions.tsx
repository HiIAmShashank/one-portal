/**
 * TableRowActions - Renders action buttons for individual table rows
 * @module data-table/components
 */

import * as React from 'react';
import { Button } from '../../components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import type { RowAction } from '../types';

interface TableRowActionsProps<TData> {
  /** Row data */
  row: TData;
  /** Action configurations */
  actions: RowAction<TData>[];
  /** Always show actions (no hover state) */
  alwaysVisible?: boolean;
}

/**
 * Renders action buttons for a single table row
 * 
 * Features:
 * - Inline button display (1-4 actions recommended)
 * - Icon + label support
 * - Variant styling (default, destructive, ghost, outline)
 * - Conditional visibility (hidden function)
 * - Conditional disabling (disabled function)
 * - Tooltips for accessibility
 * - Keyboard navigation (Tab, Enter, Space)
 * 
 * @example
 * ```tsx
 * <TableRowActions
 *   row={user}
 *   actions={[
 *     {
 *       id: 'edit',
 *       label: 'Edit',
 *       icon: <Pencil />,
 *       onClick: (user) => openEditDialog(user),
 *       hidden: (user) => !user.canEdit,
 *     },
 *     {
 *       id: 'delete',
 *       label: 'Delete',
 *       variant: 'destructive',
 *       onClick: (user) => deleteUser(user.id),
 *       disabled: (user) => user.role === 'admin',
 *     },
 *   ]}
 * />
 * ```
 */
export function TableRowActions<TData>({
  row,
  actions,
  // alwaysVisible = true, // TODO: T087 - Implement hover state
}: TableRowActionsProps<TData>) {
  // Filter out hidden actions
  const visibleActions = React.useMemo(() => {
    return actions.filter(action => {
      // If hidden function exists and returns true, filter out
      if (action.hidden && action.hidden(row)) {
        return false;
      }
      return true;
    });
  }, [actions, row]);

  // No actions to show
  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Row actions"
    >
      {visibleActions.map(action => {
        // Check if action is disabled
        const isDisabled = action.disabled ? action.disabled(row) : false;

        // Action button content
        const buttonContent = (
          <>
            {action.icon && (
              <span className="mr-2" aria-hidden="true">
                {action.icon}
              </span>
            )}
            <span>{action.label}</span>
          </>
        );

        // Handle click
        const handleClick = async () => {
          if (!isDisabled) {
            await action.onClick(row);
          }
        };

        // Handle keyboard (Enter/Space)
        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        };

        // Button element
        const button = (
          <Button
            key={action.id}
            variant={action.variant || 'ghost'}
            size="sm"
            disabled={isDisabled}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className="h-8"
            aria-label={action.tooltip || action.label}
          >
            {buttonContent}
          </Button>
        );

        // Wrap with tooltip if provided
        if (action.tooltip) {
          return (
            <TooltipProvider key={action.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {button}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return button;
      })}
    </div>
  );
}
