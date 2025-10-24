/**
 * Column Utilities - Helper functions for generating special columns
 *
 * Provides utilities to create:
 * - Selection columns (checkbox/radio)
 * - Actions columns (row actions menu)
 */

import * as React from "react";
import type { ColumnDef, RowAction } from "../types";
import { Checkbox } from "../../components/ui/checkbox";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

/**
 * Creates a selection column (checkbox or radio)
 * Following TanStack Table patterns
 */
export function createSelectionColumn<TData>(options?: {
  mode?: "single" | "multiple";
}): ColumnDef<TData> {
  const mode = options?.mode || "multiple";

  return {
    id: "select",
    header: ({ table }) => {
      // Only show header checkbox in multi-select mode
      if (mode === "single") return null;

      return (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      );
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        disabled={!row.getCanSelect()}
      />
    ),
    size: 40,
    minSize: 40,
    maxSize: 40,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  };
}

/**
 * Creates an actions column with dropdown menu
 * Following TanStack Table display column pattern
 */
export function createActionsColumn<TData>(
  actions: RowAction<TData>[],
): ColumnDef<TData> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      // Filter actions based on hidden condition
      const visibleActions = actions.filter(
        (action) => !action.hidden?.(row.original),
      );

      if (visibleActions.length === 0) return null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {visibleActions.map((action, index) => {
              const isDisabled = action.disabled?.(row.original) ?? false;
              const isDestructive = action.variant === "destructive";

              return (
                <React.Fragment key={action.id}>
                  {index > 0 && isDestructive && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => action.onClick(row.original)}
                    disabled={isDisabled}
                    className={isDestructive ? "text-destructive" : ""}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                </React.Fragment>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 60,
    minSize: 60,
    maxSize: 60,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  };
}
