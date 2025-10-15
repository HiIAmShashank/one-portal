/**
 * use-filter-inference - Enhanced filter type inference from column data
 * @module data-table/hooks/use-filter-inference
 */

import { useMemo } from 'react';
import type { Table, Column } from '@tanstack/react-table';
import type { FilterVariant } from '../types';

interface FilterInferenceResult {
  variant: FilterVariant;
  confidence: 'high' | 'medium' | 'low';
  metadata?: {
    min?: number;
    max?: number;
    step?: number;
    uniqueValues?: any[];
    dateFormat?: string;
  };
}

/**
 * Analyzes column data to infer the most appropriate filter type
 */
export function useFilterInference<TData>(
  column: Column<TData, unknown>,
  table: Table<TData>
): FilterInferenceResult {
  return useMemo(() => {
    const columnDef = column.columnDef as any;
    const meta = columnDef.meta;

    // 1. Explicit variant - highest confidence
    if (meta?.filterVariant) {
      return {
        variant: meta.filterVariant,
        confidence: 'high',
      };
    }

    // 2. Custom component - high confidence
    if (columnDef.filterComponent) {
      return {
        variant: 'custom',
        confidence: 'high',
      };
    }

    // 3. Explicit filter options - high confidence
    if (meta?.filterOptions && Array.isArray(meta.filterOptions)) {
      return {
        variant: 'select',
        confidence: 'high',
        metadata: {
          uniqueValues: meta.filterOptions,
        },
      };
    }

    // 4. Analyze actual data
    const rows = table.getPreFilteredRowModel().rows;
    if (rows.length === 0) {
      return {
        variant: 'text',
        confidence: 'low',
      };
    }

    // Collect sample values (analyze up to 100 rows for performance)
    const sampleSize = Math.min(rows.length, 100);
    const values: any[] = [];
    const uniqueValues = new Set<any>();

    for (let i = 0; i < sampleSize; i++) {
      const value = rows[i].getValue(column.id);
      // Exclude null, undefined, and empty strings
      if (value !== null && value !== undefined && value !== '') {
        values.push(value);
        uniqueValues.add(value);
      }
    }

    if (values.length === 0) {
      return {
        variant: 'text',
        confidence: 'low',
      };
    }

    const firstValue = values[0];
    const uniqueCount = uniqueValues.size;
    const totalCount = values.length;

    // Boolean detection
    if (typeof firstValue === 'boolean') {
      return {
        variant: 'boolean',
        confidence: 'high',
      };
    }

    // Number detection
    if (typeof firstValue === 'number') {
      const numbers = values.filter((v) => typeof v === 'number');
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      
      // Determine if it's a discrete set or continuous range
      const uniqueRatio = uniqueCount / totalCount;
      
      if (uniqueRatio < 0.1 && uniqueCount <= 20) {
        // Low unique ratio + small set = discrete select
        return {
          variant: 'select',
          confidence: 'medium',
          metadata: {
            uniqueValues: Array.from(uniqueValues).sort((a, b) => a - b),
          },
        };
      }
      
      // Continuous range
      return {
        variant: 'number-range',
        confidence: 'high',
        metadata: {
          min,
          max,
          step: inferStep(numbers),
        },
      };
    }

    // Date detection
    if (firstValue instanceof Date) {
      return {
        variant: 'date',
        confidence: 'high',
      };
    }

    // String date detection
    if (typeof firstValue === 'string') {
      const datePattern = /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}/;
      if (datePattern.test(firstValue)) {
        return {
          variant: 'date',
          confidence: 'medium',
        };
      }
    }

    // Array detection (multi-select)
    if (Array.isArray(firstValue)) {
      return {
        variant: 'multi-select',
        confidence: 'high',
      };
    }

    // String with low cardinality = select
    if (typeof firstValue === 'string') {
      const uniqueRatio = uniqueCount / totalCount;
      
      // If fewer than 20 unique values and low ratio, suggest select
      if (uniqueCount <= 20 && uniqueRatio < 0.5) {
        return {
          variant: 'select',
          confidence: 'medium',
          metadata: {
            uniqueValues: Array.from(uniqueValues).sort(),
          },
        };
      }
    }

    // Default to text filter
    return {
      variant: 'text',
      confidence: 'medium',
    };
  }, [column, table]);
}

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
 * Get recommended filter options for a column
 */
export function useFilterOptions<TData>(
  column: Column<TData, unknown>,
  table: Table<TData>,
  maxOptions = 50
): any[] {
  return useMemo(() => {
    const columnDef = column.columnDef as any;
    const meta = columnDef.meta;

    // Use explicit options if provided
    if (meta?.filterOptions) {
      return meta.filterOptions;
    }

    // Auto-generate from data
    const rows = table.getPreFilteredRowModel().rows;
    const uniqueValues = new Set<any>();

    for (const row of rows) {
      const value = row.getValue(column.id);
      // Exclude null, undefined, and empty strings (Radix UI requirement)
      if (value !== null && value !== undefined && value !== '') {
        uniqueValues.add(value);
        
        // Stop if we hit max options
        if (uniqueValues.size >= maxOptions) {
          break;
        }
      }
    }

    // Convert to array and sort
    const values = Array.from(uniqueValues);
    
    // Sort based on type
    const firstValue = values[0];
    if (typeof firstValue === 'number') {
      return values.sort((a, b) => a - b);
    }
    if (typeof firstValue === 'string') {
      return values.sort();
    }
    
    return values;
  }, [column, table, maxOptions]);
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
