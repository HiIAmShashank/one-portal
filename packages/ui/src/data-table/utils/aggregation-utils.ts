import type { Row } from '@tanstack/react-table';

/**
 * Built-in aggregation functions for grouped row calculations.
 * 
 * Use these when enabling row grouping in DataTable to specify how grouped rows
 * should be aggregated. Each function takes a columnId and array of leaf rows,
 * and returns the aggregated value.
 * 
 * @example
 * ```tsx
 * const columns: ColumnDef<Sale>[] = [
 *   {
 *     id: 'revenue',
 *     header: 'Revenue',
 *     accessorKey: 'amount',
 *     enableGrouping: true,
 *     aggregationFn: aggregationFunctions.sum, // Sum all amounts in group
 *     aggregatedCell: createAggregatedCellRenderer('sum', '$'),
 *   },
 *   {
 *     id: 'itemCount',
 *     header: 'Items',
 *     aggregationFn: aggregationFunctions.count, // Count rows in group
 *     aggregatedCell: ({ getValue }) => `${getValue()} items`,
 *   },
 *   {
 *     id: 'avgPrice',
 *     header: 'Avg Price',
 *     accessorKey: 'price',
 *     aggregationFn: aggregationFunctions.average, // Average price
 *     aggregatedCell: createAggregatedCellRenderer('average', '$'),
 *   }
 * ]
 * ```
 * 
 * Available functions:
 * - `sum`: Add all numeric values in the group
 * - `count`: Count the number of rows in the group
 * - `average` / `mean`: Calculate mean of numeric values
 * - `min`: Find minimum numeric value
 * - `max`: Find maximum numeric value
 * - `median`: Calculate median of numeric values
 * - `unique`: Get array of unique values
 * - `uniqueCount`: Count unique values
 * - `extent`: Get [min, max] tuple
 */
export const aggregationFunctions = {
  sum: <TData,>(columnId: string, leafRows: Row<TData>[]): number => {
    return leafRows.reduce((sum, row) => {
      const value = row.getValue(columnId);
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  },

  count: <TData,>(_columnId: string, leafRows: Row<TData>[]): number => {
    return leafRows.length;
  },

  average: <TData,>(columnId: string, leafRows: Row<TData>[]): number => {
    const sum = leafRows.reduce((acc, row) => {
      const value = row.getValue(columnId);
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);
    return leafRows.length > 0 ? sum / leafRows.length : 0;
  },

  mean: <TData,>(columnId: string, leafRows: Row<TData>[]): number => {
    return aggregationFunctions.average(columnId, leafRows);
  },

  min: <TData,>(columnId: string, leafRows: Row<TData>[]): number => {
    const values = leafRows
      .map(row => row.getValue(columnId))
      .filter((v): v is number => typeof v === 'number');
    return values.length > 0 ? Math.min(...values) : 0;
  },

  max: <TData,>(columnId: string, leafRows: Row<TData>[]): number => {
    const values = leafRows
      .map(row => row.getValue(columnId))
      .filter((v): v is number => typeof v === 'number');
    return values.length > 0 ? Math.max(...values) : 0;
  },

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

  unique: <TData,>(columnId: string, leafRows: Row<TData>[]): any[] => {
    const values = leafRows.map(row => row.getValue(columnId));
    return Array.from(new Set(values));
  },

  uniqueCount: <TData,>(columnId: string, leafRows: Row<TData>[]): number => {
    return aggregationFunctions.unique(columnId, leafRows).length;
  },

  extent: <TData,>(columnId: string, leafRows: Row<TData>[]): [number, number] => {
    return [
      aggregationFunctions.min(columnId, leafRows),
      aggregationFunctions.max(columnId, leafRows),
    ];
  },
};

/**
 * Format aggregated values with appropriate number formatting and labels.
 * 
 * Provides sensible defaults for different aggregation types:
 * - `sum`, `min`, `max`: Locale-formatted numbers (1,234.56)
 * - `count`: "N items" or "1 item"
 * - `average`, `median`: Fixed 2 decimal places
 * - `custom`: String conversion
 * 
 * @example
 * ```tsx
 * formatAggregatedValue(1234.567, 'sum')     // "1,234.567"
 * formatAggregatedValue(5, 'count')          // "5 items"
 * formatAggregatedValue(1, 'count')          // "1 item"
 * formatAggregatedValue(123.456, 'average')  // "123.46"
 * ```
 * 
 * @param value - The aggregated value to format
 * @param type - The aggregation type (determines formatting)
 * @returns Formatted string representation
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
 * Create a cell renderer function for aggregated values with optional prefix/suffix.
 * 
 * This is a convenience function that combines `formatAggregatedValue` with
 * prefix/suffix strings (e.g., currency symbols, units).
 * 
 * @example
 * ```tsx
 * const columns: ColumnDef<Sale>[] = [
 *   {
 *     id: 'revenue',
 *     header: 'Revenue',
 *     accessorKey: 'amount',
 *     aggregationFn: aggregationFunctions.sum,
 *     aggregatedCell: createAggregatedCellRenderer('sum', '$'), // "$1,234.56"
 *   },
 *   {
 *     id: 'weight',
 *     header: 'Weight',
 *     accessorKey: 'weight',
 *     aggregationFn: aggregationFunctions.sum,
 *     aggregatedCell: createAggregatedCellRenderer('sum', '', ' kg'), // "1,234 kg"
 *   },
 *   {
 *     id: 'avgRating',
 *     header: 'Avg Rating',
 *     accessorKey: 'rating',
 *     aggregationFn: aggregationFunctions.average,
 *     aggregatedCell: createAggregatedCellRenderer('average', '', ' ★'), // "4.25 ★"
 *   }
 * ]
 * ```
 * 
 * @param type - The aggregation type (determines formatting)
 * @param prefix - Optional string to prepend (e.g., "$", "€")
 * @param suffix - Optional string to append (e.g., " kg", " items")
 * @returns Cell renderer function compatible with TanStack Table
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
