/**
 * use-filter-inference - Enhanced filter type inference from column data
 * @module data-table/hooks/use-filter-inference
 */

import { useMemo } from 'react';
import type { Table, Column } from '@tanstack/react-table';

/**
 * Infer appropriate step value for number range based on data
 */
function inferStep(numbers: number[]): number {
  // Check if all numbers are integers
  const allIntegers = numbers.every((n) => Number.isInteger(n));
  if (allIntegers) {
    return 1;
  }

  // Calculate decimal places
  const decimalPlaces = numbers.map((n) => {
    const str = n.toString();
    const decimalIndex = str.indexOf('.');
    return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
  });

  const maxDecimals = Math.max(...decimalPlaces);

  if (maxDecimals === 1) return 0.1;
  if (maxDecimals === 2) return 0.01;
  if (maxDecimals === 3) return 0.001;

  return 0.01; // Default
}

/**
 * Get numeric range metadata for number-range filters
 */
export function useNumberRange<TData>(
  column: Column<TData, unknown>,
  table: Table<TData>
): { min: number; max: number; step: number } | null {
  return useMemo(() => {
    const rows = table.getPreFilteredRowModel().rows;
    const numbers: number[] = [];

    for (const row of rows) {
      const value = row.getValue(column.id);
      if (typeof value === 'number') {
        numbers.push(value);
      }
    }

    if (numbers.length === 0) {
      return null;
    }

    return {
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      step: inferStep(numbers),
    };
  }, [column, table]);
}
