/**
 * useColumnResize hook - Manages column width state and resize handlers
 * @module data-table/hooks/use-column-resize
 */

import { useState, useCallback } from 'react';
import type { ColumnSizingState } from '../types';

interface UseColumnResizeProps {
  initialSizing?: ColumnSizingState;
  onSizingChange?: (sizing: ColumnSizingState) => void;
}

interface UseColumnResizeReturn {
  columnSizing: ColumnSizingState;
  setColumnSizing: (sizing: ColumnSizingState | ((prev: ColumnSizingState) => ColumnSizingState)) => void;
  resetColumnSizing: () => void;
}

/**
 * Hook for managing column resize state
 */
export function useColumnResize({
  initialSizing = {},
  onSizingChange,
}: UseColumnResizeProps = {}): UseColumnResizeReturn {
  const [columnSizing, setColumnSizingInternal] = useState<ColumnSizingState>(initialSizing);

  const setColumnSizing = useCallback(
    (value: ColumnSizingState | ((prev: ColumnSizingState) => ColumnSizingState)) => {
      const newSizing = value instanceof Function ? value(columnSizing) : value;
      setColumnSizingInternal(newSizing);
      onSizingChange?.(newSizing);
    },
    [columnSizing, onSizingChange]
  );

  const resetColumnSizing = useCallback(() => {
    setColumnSizingInternal(initialSizing);
    onSizingChange?.(initialSizing);
  }, [initialSizing, onSizingChange]);

  return {
    columnSizing,
    setColumnSizing,
    resetColumnSizing,
  };
}
