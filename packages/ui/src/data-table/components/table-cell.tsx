/**
 * TableCell Component - Handles inline editing for table cells
 * @module data-table/components/table-cell
 */

import * as React from 'react';
import { flexRender, type Cell, type Column, type Row } from '@tanstack/react-table';
import { Pencil, Loader2, Check, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { EditInputType, Density } from '../types';

export interface TableCellProps<TData> {
  cell: Cell<TData, unknown>;
  column: Column<TData>;
  row: Row<TData>;
  enableInlineEditing?: boolean;
  getRowCanEdit?: (row: TData) => boolean;
  onEditCell?: (params: {
    row: TData;
    columnId: string;
    newValue: any;
    oldValue: any;
  }) => void | Promise<void>;
  enableGrouping?: boolean;
  enableExpanding?: boolean;
  density?: Density;
}

export function TableCell<TData>({
  cell,
  column,
  row,
  enableInlineEditing,
  getRowCanEdit,
  onEditCell,
  enableGrouping = false,
  enableExpanding = false,
  density = 'default',
}: TableCellProps<TData>) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(cell.getValue());
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Density classes
  const densityClasses: Record<Density, string> = {
    compact: 'py-1 px-2 text-xs',
    default: 'py-2 px-3 text-sm',
    relaxed: 'py-4 px-4 text-base',
  };

  // Check if this cell is editable
  const isEditable = React.useMemo(() => {
    const col = column.columnDef as any;

    // Check table-level
    if (!enableInlineEditing) return false;

    // Check column-level
    if (!col.editable) return false;

    // Check row-level
    if (getRowCanEdit && !getRowCanEdit(row.original)) return false;

    // Check cell-level
    if (col.getCellCanEdit && !col.getCellCanEdit(row.original)) return false;

    return true;
  }, [column, row, enableInlineEditing, getRowCanEdit]);

  // Auto-focus input when entering edit mode
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Only select text for text-based inputs (select/textarea don't have .select())
      if ('select' in inputRef.current && typeof inputRef.current.select === 'function') {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  // Reset edit value when cell value changes externally
  React.useEffect(() => {
    setEditValue(cell.getValue());
  }, [cell]);

  // Auto-detect input type based on value
  const getDefaultInputType = (value: any): EditInputType => {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'checkbox';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string') {
      if (value.includes('@')) return 'email';
      if (value.match(/^\d{4}-\d{2}-\d{2}/)) return 'date';
      return 'text';
    }
    return 'text';
  };

  const handleCellClick = () => {
    if (!isEditable || isEditing) return;

    const col = column.columnDef as any;
    const currentValue = cell.getValue();

    // Transform value for editing if needed
    const initialEditValue = col.getEditValue
      ? col.getEditValue(currentValue)
      : currentValue;

    setEditValue(initialEditValue);
    setIsEditing(true);
    setError(null);
  };

  const handleSave = async () => {
    const col = column.columnDef as any;

    // Validate if validator provided
    if (col.validate) {
      const result = col.validate(editValue, row.original);
      if (result !== true) {
        setError(result);
        return;
      }
    }

    // Transform value if needed
    const finalValue = col.setEditValue ? col.setEditValue(editValue) : editValue;

    // Skip if value hasn't changed
    if (finalValue === cell.getValue()) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call parent callback
      await onEditCell?.({
        row: row.original,
        columnId: column.id,
        newValue: finalValue,
        oldValue: cell.getValue(),
      });

      // Success!
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 600);
    } catch (err: any) {
      // Error - stay in edit mode
      setError(err.message || 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(cell.getValue()); // Restore original value
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Tab') {
      // Don't prevent default - let browser handle Tab
      // But save current cell before moving
      handleSave();
    }
  };

  const handleBlur = () => {
    // Small timeout to allow other handlers to run first
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 100);
  };

  const renderEditInput = () => {
    const col = column.columnDef as any;

    // Custom component takes priority
    if (col.editComponent) {
      const EditComponent = col.editComponent;
      return (
        <EditComponent
          value={editValue}
          onChange={setEditValue}
          onSave={handleSave}
          onCancel={handleCancel}
          row={row.original}
          columnId={column.id}
        />
      );
    }

    // Use explicit type or auto-detect
    const inputType = col.editType || getDefaultInputType(cell.getValue());

    const inputClassName = cn(
      'w-full h-full px-2 py-1 border-2 rounded',
      'focus:outline-none focus:ring-0',
      error
        ? 'border-destructive focus:border-destructive'
        : 'border-primary focus:border-primary focus:shadow-[0_0_0_2px_hsl(var(--primary)/0.2)]',
      'font-inherit text-inherit bg-background'
    );

    switch (inputType) {
      case 'select': {
        const options = col.editOptions || [];
        return (
          <select
            ref={inputRef as any}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={inputClassName}
            disabled={isLoading}
            {...col.editProps}
          >
            {options.map((opt: any) => {
              const { label, value } =
                typeof opt === 'object' ? opt : { label: String(opt), value: opt };
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        );
      }

      case 'textarea':
        return (
          <textarea
            ref={inputRef as any}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={inputClassName}
            disabled={isLoading}
            {...col.editProps}
          />
        );

      case 'checkbox':
        return (
          <input
            ref={inputRef}
            type="checkbox"
            checked={Boolean(editValue)}
            onChange={(e) => {
              setEditValue(e.target.checked);
              // Auto-save for checkboxes
              setTimeout(() => handleSave(), 0);
            }}
            className="h-4 w-4"
            disabled={isLoading}
          />
        );

      case 'date':
        return (
          <input
            ref={inputRef}
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={inputClassName}
            disabled={isLoading}
            {...col.editProps}
          />
        );

      case 'number':
        return (
          <input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={inputClassName}
            disabled={isLoading}
            {...col.editProps}
          />
        );

      default: // 'text' or 'email'
        return (
          <input
            ref={inputRef}
            type={inputType}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={inputClassName}
            disabled={isLoading}
            {...col.editProps}
          />
        );
    }
  };

  // Phase 10: Row Grouping - Check if this is a grouped, aggregated, or placeholder cell
  const isGroupedCell = enableGrouping && cell.getIsGrouped();
  const isAggregatedCell = enableGrouping && cell.getIsAggregated();
  const isPlaceholderCell = enableGrouping && cell.getIsPlaceholder();

  // Render grouped cell (with expand/collapse button)
  if (isGroupedCell) {
    const isExpanded = row.getIsExpanded();
    const subRowsCount = row.subRows?.length || 0;

    return (
      <td
        className={cn(
          'align-middle',
          densityClasses[density],
          'bg-muted/30 font-medium'
        )}
        colSpan={1}
      >
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={row.getToggleExpandedHandler()}
          style={{ paddingLeft: `${row.depth * 2}rem` }}
        >
          {row.getCanExpand() ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : null}
          <span>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </span>
          <span className="text-muted-foreground text-xs">
            ({subRowsCount})
          </span>
        </div>
      </td>
    );
  }

  // Render aggregated cell
  if (isAggregatedCell) {
    const aggregatedCell = cell.column.columnDef.aggregatedCell;
    
    return (
      <td
        className={cn(
          'align-middle',
          densityClasses[density],
          'bg-orange-50 dark:bg-orange-950/30 font-semibold'
        )}
      >
        {aggregatedCell 
          ? flexRender(aggregatedCell, cell.getContext())
          : flexRender(cell.column.columnDef.cell, cell.getContext())
        }
      </td>
    );
  }

  // Render placeholder cell (repeated values in grouped columns)
  if (isPlaceholderCell) {
    return (
      <td
        className={cn(
          'align-middle',
          densityClasses[density],
          'bg-red-50/50 dark:bg-red-950/20'
        )}
      >
        {/* Empty - value is shown in the group header */}
      </td>
    );
  }

  // Phase 10: Row Expanding - Check if this is the first visible cell
  const isFirstCell = enableExpanding && cell.column.id === row.getVisibleCells()[0]?.column.id;
  const canExpand = enableExpanding && row.getCanExpand();
  const isExpanded = row.getIsExpanded();

  return (
    <td
      className={cn(
        'align-middle',
        densityClasses[density],
        isEditing && 'p-0',
        !isEditing && isEditable && 'cursor-pointer transition-colors hover:bg-muted/50',
        isLoading && 'opacity-60 pointer-events-none'
      )}
      onClick={!isEditing ? handleCellClick : undefined}
      role={isEditable ? 'button' : undefined}
      tabIndex={isEditable && !isEditing ? 0 : undefined}
      aria-label={isEditable && !isEditing ? `Edit ${cell.column.id}` : undefined}
      onKeyDown={
        isEditable && !isEditing
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCellClick();
              }
            }
          : undefined
      }
    >
      {isEditing ? (
        <div className="min-h-[2.5rem] flex items-center" role="form">
          {renderEditInput()}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          {/* Expand button (only for first cell when expanding is enabled) */}
          {isFirstCell && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                row.toggleExpanded();
              }}
              className={cn(
                'flex-shrink-0 p-0.5 rounded hover:bg-muted transition-colors',
                !canExpand && 'invisible'
              )}
              aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
            >
              {canExpand && (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              )}
              {!canExpand && <div className="h-4 w-4" />}
            </button>
          )}
          
          <span className="flex-1 min-w-0">
            {cell.column.columnDef.cell 
              ? flexRender(cell.column.columnDef.cell, cell.getContext())
              : cell.getValue() as React.ReactNode
            }
          </span>
          {isEditable && !isLoading && !showSuccess && (
            <Pencil 
              className="h-3 w-3 opacity-0 group-hover/row:opacity-50 transition-opacity flex-shrink-0" 
              aria-hidden="true"
            />
          )}
          {isLoading && (
            <Loader2 
              className="h-3 w-3 animate-spin text-muted-foreground flex-shrink-0" 
              aria-label="Saving"
            />
          )}
          {showSuccess && (
            <Check 
              className="h-3 w-3 text-green-600 animate-in fade-in duration-200 flex-shrink-0" 
              aria-label="Saved successfully"
            />
          )}
          {error && (
            <AlertCircle 
              className="h-3 w-3 text-destructive flex-shrink-0" 
              aria-label="Error"
            />
          )}
        </div>
      )}
      {error && (
        <div className="text-xs text-destructive mt-1 px-2" role="alert">
          {error}
        </div>
      )}
    </td>
  );
}

TableCell.displayName = 'TableCell';
