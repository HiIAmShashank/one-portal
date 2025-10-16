/**
 * Aggregation utility functions for row grouping
 * @module data-table/utils/aggregation-utils
 */

import type { Row } from '@tanstack/react-table';

/**
 * Built-in aggregation functions for common use cases
 * These can be used directly in column definitions via aggregationFn
 */
export const aggregationFunctions = {
  /**
   * Sum of all values in the group
   */
  sum: <TData,>(columnId: string, leafRows: Row<TData>[]): number => {
    return leafRows.reduce((sum, row) => {
      const value = row.getValue(columnId);
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  },

  /**
   * Count of rows in the group
   */
  count: <TData,>(_columnId: string, leafRows: Row<TData>[]): number => {
    return leafRows.length;
  },

  /**
   * Average of all values in the group
   */
  average: <TData,>(columnId: string, leafRows: Row<TData>[]): number => {
    const sum = leafRows.reduce((acc, row) => {
      const value = row.getValue(columnId);
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);
    return leafRows.length > 0 ? sum / leafRows.length : 0;
  },

  /**
   * Mean (alias for average)
   */
  mean: <TData,>(columnId: string, leafRows: Row<TData>[]): number => {
    return aggregationFunctions.average(columnId, leafRows);
  },

  /**
   * Minimum value in the group
   */
  min: <TData,>(columnId: string, leafRows: Row<TData>[]): number => {
    const values = leafRows
      .map(row => row.getValue(columnId))
      .filter((v): v is number => typeof v === 'number');
    return values.length > 0 ? Math.min(...values) : 0;
  },

  /**
   * Maximum value in the group
   */
  max: <TData,>(columnId: string, leafRows: Row<TData>[]): number => {
    const values = leafRows
      .map(row => row.getValue(columnId))
      .filter((v): v is number => typeof v === 'number');
    return values.length > 0 ? Math.max(...values) : 0;
  },

  /**
   * Median value in the group
   */
  median: <TData,>(columnId: string, leafRows: Row<TData>[]): number => {
    const values = leafRows
      .map(row => row.getValue(columnId))
      .filter((v): v is number => typeof v === 'number')
      .sort((a, b) => a - b);
    
    if (values.length === 0) return 0;
    
    const mid = Math.floor(values.length / 2);
    return values.length % 2 === 0
      ? (values[mid - 1] + values[mid]) / 2
      : values[mid];
  },

  /**
   * Array of unique values
   */
  unique: <TData,>(columnId: string, leafRows: Row<TData>[]): any[] => {
    const values = leafRows.map(row => row.getValue(columnId));
    return Array.from(new Set(values));
  },

  /**
   * Count of unique values
   */
  uniqueCount: <TData,>(columnId: string, leafRows: Row<TData>[]): number => {
    return aggregationFunctions.unique(columnId, leafRows).length;
  },

  /**
   * Extent [min, max] of values
   */
  extent: <TData,>(columnId: string, leafRows: Row<TData>[]): [number, number] => {
    return [
      aggregationFunctions.min(columnId, leafRows),
      aggregationFunctions.max(columnId, leafRows),
    ];
  },
};

/**
 * Format aggregated values for display
 */
export const formatAggregatedValue = (
  value: any,
  type: 'sum' | 'count' | 'average' | 'min' | 'max' | 'median' | 'custom' = 'custom'
): string => {
  if (value === null || value === undefined) return '-';

  switch (type) {
    case 'sum':
      return typeof value === 'number' ? value.toLocaleString() : String(value);
    
    case 'count':
      return `${value} ${value === 1 ? 'item' : 'items'}`;
    
    case 'average':
    case 'median':
      return typeof value === 'number' ? value.toFixed(2) : String(value);
    
    case 'min':
    case 'max':
      return typeof value === 'number' ? value.toLocaleString() : String(value);
    
    default:
      return String(value);
  }
};

/**
 * Helper to create a formatted aggregated cell renderer
 */
export const createAggregatedCellRenderer = (
  type: 'sum' | 'count' | 'average' | 'min' | 'max' | 'median',
  prefix?: string,
  suffix?: string
) => {
  return ({ getValue }: { getValue: () => any }) => {
    const value = getValue();
    const formatted = formatAggregatedValue(value, type);
    return `${prefix || ''}${formatted}${suffix || ''}`;
  };
};
