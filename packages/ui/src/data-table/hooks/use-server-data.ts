/**
 * useServerData - Helper hook for server-side data integration with DataTable
 * @module data-table/hooks
 */

import * as React from 'react';
import type {
  ServerSideParams,
  ServerSideResponse,
  PaginationState,
  SortingState,
  ColumnFiltersState,
} from '../types';

export interface UseServerDataOptions<TData> {
  /**
   * Function to fetch data from server
   * Called whenever pagination, sorting, or filtering changes
   */
  fetchFn: (params: ServerSideParams) => Promise<ServerSideResponse<TData>>;

  /**
   * Initial pagination state
   * @default { pageIndex: 0, pageSize: 10 }
   */
  initialPagination?: PaginationState;

  /**
   * Initial sorting state
   * @default []
   */
  initialSorting?: SortingState;

  /**
   * Initial filters state
   * @default []
   */
  initialFilters?: ColumnFiltersState;

  /**
   * Enable automatic refetch when params change
   * @default true
   */
  autoRefetch?: boolean;

  /**
   * Debounce delay in milliseconds for filter changes
   * @default 300
   */
  filterDebounce?: number;

  /**
   * Callback when fetch starts
   */
  onFetchStart?: () => void;

  /**
   * Callback when fetch succeeds
   */
  onFetchSuccess?: (data: ServerSideResponse<TData>) => void;

  /**
   * Callback when fetch fails
   */
  onFetchError?: (error: Error) => void;
}

export interface UseServerDataReturn<TData> {
  /** Current data from server */
  data: TData[];

  /** Total row count from server */
  rowCount: number;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: Error | null;

  /** Current pagination state */
  pagination: PaginationState;

  /** Current sorting state */
  sorting: SortingState;

  /** Current filters state */
  filters: ColumnFiltersState;

  /** Update pagination */
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;

  /** Update sorting */
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;

  /** Update filters */
  setFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;

  /** Manually trigger refetch */
  refetch: () => Promise<void>;

  /** Reset to initial state */
  reset: () => void;
}

/**
 * Hook for integrating DataTable with server-side data sources
 * 
 * Handles:
 * - Automatic fetching when pagination/sorting/filtering changes
 * - Loading and error states
 * - Filter debouncing
 * - Manual refetch
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const serverData = useServerData({
 *   fetchFn: async (params) => {
 *     const response = await fetch('/api/users', {
 *       method: 'POST',
 *       body: JSON.stringify(params),
 *     });
 *     return response.json();
 *   },
 * });
 * 
 * <DataTable
 *   data={serverData.data}
 *   columns={columns}
 *   manualPagination
 *   manualSorting
 *   manualFiltering
 *   rowCount={serverData.rowCount}
 *   state={{
 *     pagination: serverData.pagination,
 *     sorting: serverData.sorting,
 *     columnFilters: serverData.filters,
 *   }}
 *   onPaginationChange={serverData.setPagination}
 *   onSortingChange={serverData.setSorting}
 *   onColumnFiltersChange={serverData.setFilters}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // With React Query
 * const serverData = useServerData({
 *   fetchFn: async (params) => {
 *     const response = await queryClient.fetchQuery({
 *       queryKey: ['users', params],
 *       queryFn: () => fetchUsers(params),
 *     });
 *     return response;
 *   },
 *   onFetchError: (error) => {
 *     toast.error('Failed to load data');
 *   },
 * });
 * ```
 */
export function useServerData<TData>({
  fetchFn,
  initialPagination = { pageIndex: 0, pageSize: 10 },
  initialSorting = [],
  initialFilters = [],
  autoRefetch = true,
  filterDebounce = 300,
  onFetchStart,
  onFetchSuccess,
  onFetchError,
}: UseServerDataOptions<TData>): UseServerDataReturn<TData> {
  // State
  const [data, setData] = React.useState<TData[]>([]);
  const [rowCount, setRowCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  const [pagination, setPagination] = React.useState<PaginationState>(initialPagination);
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [filters, setFilters] = React.useState<ColumnFiltersState>(initialFilters);

  // Debounced filters for API calls
  const [debouncedFilters, setDebouncedFilters] = React.useState(filters);

  // Debounce filter changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, filterDebounce);

    return () => clearTimeout(timer);
  }, [filters, filterDebounce]);

  // Fetch function
  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      onFetchStart?.();

      // Transform DataTable state to server params format
      const params: ServerSideParams = {
        page: pagination.pageIndex + 1, // Server uses 1-indexed pages
        pageSize: pagination.pageSize,
        sortBy: sorting[0]?.id,
        sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
        filters: debouncedFilters.reduce((acc, filter) => {
          acc[filter.id] = filter.value;
          return acc;
        }, {} as Record<string, any>),
      };

      const response = await fetchFn(params);

      setData(response.data);
      setRowCount(response.totalCount);
      onFetchSuccess?.(response);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);
      onFetchError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, pagination, sorting, debouncedFilters, onFetchStart, onFetchSuccess, onFetchError]);

  // Auto-fetch when params change
  React.useEffect(() => {
    if (autoRefetch) {
      fetchData();
    }
  }, [fetchData, autoRefetch]);

  // Reset function
  const reset = React.useCallback(() => {
    setPagination(initialPagination);
    setSorting(initialSorting);
    setFilters(initialFilters);
    setError(null);
  }, [initialPagination, initialSorting, initialFilters]);

  return {
    data,
    rowCount,
    isLoading,
    error,
    pagination,
    sorting,
    filters,
    setPagination,
    setSorting,
    setFilters,
    refetch: fetchData,
    reset,
  };
}

/**
 * Helper function to create server-side params from DataTable state
 * Useful when manually managing server requests
 */
export function createServerParams(
  pagination: PaginationState,
  sorting: SortingState,
  filters: ColumnFiltersState
): ServerSideParams {
  return {
    page: pagination.pageIndex + 1, // Server uses 1-indexed pages
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    filters: filters.reduce((acc, filter) => {
      acc[filter.id] = filter.value;
      return acc;
    }, {} as Record<string, any>),
  };
}

/**
 * Helper function to transform server response to DataTable format
 * Useful when server response doesn't match expected format
 */
export function transformServerResponse<TData, TServerData = any>(
  serverData: TServerData,
  options: {
    dataPath?: string;
    totalCountPath?: string;
    dataTransform?: (data: any) => TData[];
    totalCountTransform?: (count: any) => number;
  } = {}
): ServerSideResponse<TData> {
  const {
    dataPath = 'data',
    totalCountPath = 'total',
    dataTransform = (data) => data,
    totalCountTransform = (count) => count,
  } = options;

  const data = dataPath.split('.').reduce((obj, key) => obj?.[key], serverData as any);
  const totalCount = totalCountPath.split('.').reduce((obj, key) => obj?.[key], serverData as any);

  return {
    data: dataTransform(data || []),
    totalCount: totalCountTransform(totalCount || 0),
    page: 1,
    pageSize: 10,
  };
}
