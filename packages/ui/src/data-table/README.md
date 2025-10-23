# DataTable Component

A powerful, feature-rich data table component built on [TanStack Table v8](https://tanstack.com/table/v8) with automatic localStorage persistence, advanced filtering, sorting, grouping, and more.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [localStorage Persistence](#localstorage-persistence)
- [Core Features](#core-features)
  - [Sorting](#sorting)
  - [Filtering](#filtering)
  - [Pagination](#pagination)
  - [Column Visibility](#column-visibility)
  - [Column Resizing](#column-resizing)
  - [Column Reordering](#column-reordering)
  - [Column Pinning](#column-pinning)
- [Advanced Features](#advanced-features)
  - [Row Grouping](#row-grouping)
  - [Row Expanding](#row-expanding)
  - [Aggregation](#aggregation)
  - [Inline Editing](#inline-editing)
  - [Row Selection](#row-selection)
  - [Bulk Actions](#bulk-actions)
  - [Server-Side Data](#server-side-data)
- [UI Customization](#ui-customization)
  - [Density Control](#density-control)
  - [Filter Modes](#filter-modes)
  - [Sticky Headers & Columns](#sticky-headers--columns)
  - [Variants](#variants)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Migration Guide](#migration-guide)

---

## Features

✨ **Automatic Persistence**: Table state automatically saves to localStorage with `tableId` prop  
🔍 **Advanced Filtering**: Multiple filter types (text, number range, date range, boolean, array)  
📊 **Row Grouping & Aggregation**: Group rows and aggregate values (sum, count, average, etc.)  
🎨 **Customizable UI**: Density control, filter modes, sticky headers, variants  
📱 **Responsive**: Column resizing, reordering, pinning, and visibility controls  
⚡ **Server-Side Support**: Built-in support for server-side pagination, sorting, and filtering  
✏️ **Inline Editing**: Edit cells directly in the table  
✅ **Row Selection**: Single or multiple row selection with bulk actions  
🎯 **Type-Safe**: Full TypeScript support with generics  

---

## Quick Start

### Basic Usage

```tsx
import { DataTable, type ColumnDef } from '@repo/ui/data-table';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: 'Role',
  },
];

function UserTable() {
  const users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ];

  return (
    <DataTable
      tableId="users-table"  // Required for persistence
      data={users}
      columns={columns}
    />
  );
}
```

---

## localStorage Persistence

The DataTable component **automatically persists** user preferences to `localStorage` when you provide a `tableId` prop. This ensures users' table customizations are preserved across page reloads.

### What Gets Persisted

✅ **Column Visibility**: Which columns are shown/hidden  
✅ **Column Order**: The arrangement of columns  
✅ **Column Sizing**: Custom column widths  
✅ **Column Pinning**: Left/right pinned columns  
✅ **Density**: Table spacing (compact/default/relaxed)  
✅ **Filter Mode**: Inline or popover filter display  
✅ **Grouping**: Grouped columns  
✅ **Expanded State**: Which groups/rows are expanded  

### What Doesn't Get Persisted

❌ **Pagination**: Current page and page size  
❌ **Sorting**: Sort state  
❌ **Filters**: Active filter values  
❌ **Row Selection**: Selected rows  
❌ **Global Filter**: Search text  

> **Rationale**: Transient state (filters, search, selection) resets on page load to prevent confusion. Structural preferences (columns, layout) persist for convenience.

### localStorage Keys

Each `tableId` creates 5 localStorage keys:

```
oneportal-datatable-{tableId}-state           // Main column state
oneportal-datatable-{tableId}-density         // Spacing preference
oneportal-datatable-{tableId}-filterMode      // Filter UI mode
oneportal-datatable-{tableId}-grouping        // Grouped columns
oneportal-datatable-{tableId}-expanded        // Expanded rows
```

### Multi-Table Scenarios

Use **unique tableIds** for each table to avoid state conflicts:

```tsx
// Users table
<DataTable tableId="users-table" data={users} columns={userColumns} />

// Products table (different tableId)
<DataTable tableId="products-table" data={products} columns={productColumns} />
```

### Disabling Persistence

Set `enablePersistence={false}` to disable all localStorage operations:

```tsx
<DataTable
  tableId="temporary-table"
  data={data}
  columns={columns}
  enablePersistence={false}  // No persistence
/>
```

### Clearing Persisted State

**For Development/Testing:**

```typescript
// Clear specific table
localStorage.removeItem('oneportal-datatable-users-table-state');
localStorage.removeItem('oneportal-datatable-users-table-density');
localStorage.removeItem('oneportal-datatable-users-table-filterMode');
localStorage.removeItem('oneportal-datatable-users-table-grouping');
localStorage.removeItem('oneportal-datatable-users-table-expanded');

// Or clear all DataTable state
Object.keys(localStorage)
  .filter(key => key.startsWith('oneportal-datatable-'))
  .forEach(key => localStorage.removeItem(key));
```

**See [PERSISTENCE.md](./PERSISTENCE.md) for detailed persistence documentation.**

---

## Core Features

### Sorting

**Enable sorting** (enabled by default):

```tsx
<DataTable
  tableId="users"
  data={users}
  columns={columns}
  enableSorting={true}  // Default: true
  initialSortingState={[
    { id: 'name', desc: false }  // Sort by name ascending
  ]}
/>
```

**Column-specific sorting:**

```tsx
const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,  // Allow sorting
  },
  {
    id: 'id',
    accessorKey: 'id',
    header: 'ID',
    enableSorting: false,  // Disable sorting for this column
  },
];
```

### Filtering

The DataTable supports **multiple filter types** for different data types.

#### Built-in Filter Functions

```tsx
import {
  defaultTextFilter,
  exactMatchFilter,
  numberRangeFilter,
  dateRangeFilter,
  arrayIncludesFilter,
  booleanFilter,
} from '@repo/ui/data-table';

const columns: ColumnDef<Product>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Product Name',
    filterFn: defaultTextFilter,  // Case-insensitive text search
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: 'Price',
    filterFn: numberRangeFilter,  // Min/max range
  },
  {
    id: 'releaseDate',
    accessorKey: 'releaseDate',
    header: 'Release Date',
    filterFn: dateRangeFilter,  // Date range
  },
  {
    id: 'inStock',
    accessorKey: 'inStock',
    header: 'In Stock',
    filterFn: booleanFilter,  // True/false
  },
  {
    id: 'tags',
    accessorKey: 'tags',
    header: 'Tags',
    filterFn: arrayIncludesFilter,  // Multi-value matching
  },
];
```

#### Global Filter

Enable global search across all columns:

```tsx
<DataTable
  tableId="products"
  data={products}
  columns={columns}
  enableGlobalFilter={true}  // Default: true
/>
```

### Pagination

**Client-side pagination** (enabled by default):

```tsx
<DataTable
  tableId="users"
  data={users}
  columns={columns}
  enablePagination={true}  // Default: true
  initialPageSize={10}
  pageSizeOptions={[5, 10, 25, 50, 100]}
/>
```

**Server-side pagination**: See [Server-Side Data](#server-side-data)

### Column Visibility

**Control which columns are visible:**

```tsx
<DataTable
  tableId="users"
  data={users}
  columns={columns}
  enableColumnVisibility={true}  // Default: true
  initialColumnVisibility={{
    email: false,  // Hide email column by default
    role: true,
  }}
/>
```

Users can toggle column visibility using the column visibility menu in the toolbar.

### Column Resizing

**Allow users to resize columns:**

```tsx
<DataTable
  tableId="products"
  data={products}
  columns={columns}
  enableColumnResizing={true}  // Default: true
/>
```

**Set column size constraints:**

```tsx
const columns: ColumnDef<Product>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    size: 200,      // Default width
    minSize: 100,   // Minimum width
    maxSize: 400,   // Maximum width
  },
];
```

### Column Reordering

**Enable drag-and-drop column reordering:**

```tsx
<DataTable
  tableId="users"
  data={users}
  columns={columns}
  enableColumnReordering={true}  // Default: true
  initialColumnOrder={['name', 'email', 'role']}  // Initial order
/>
```

### Column Pinning

**Pin columns to left or right:**

```tsx
<DataTable
  tableId="sales"
  data={sales}
  columns={columns}
  enableColumnPinning={true}  // Default: true
  initialColumnPinning={{
    left: ['name'],      // Pin name to left
    right: ['actions'],  // Pin actions to right
  }}
/>
```

---

## Advanced Features

### Row Grouping

**Group rows by column values:**

```tsx
<DataTable
  tableId="sales"
  data={sales}
  columns={columns}
  enableGrouping={true}
  initialGrouping={['category', 'region']}  // Group by category, then region
/>
```

**Column-specific grouping:**

```tsx
const columns: ColumnDef<Sale>[] = [
  {
    id: 'category',
    accessorKey: 'category',
    header: 'Category',
    enableGrouping: true,  // Allow grouping by this column
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: 'Amount',
    enableGrouping: false,  // Don't allow grouping by amount
  },
];
```

### Row Expanding

**Expand rows to show additional details:**

```tsx
<DataTable
  tableId="orders"
  data={orders}
  columns={columns}
  enableExpanding={true}
  renderExpandedRow={(row) => (
    <div className="p-4 bg-muted">
      <h4>Order Details</h4>
      <pre>{JSON.stringify(row.original, null, 2)}</pre>
    </div>
  )}
/>
```

**Hierarchical data (tree structure):**

```tsx
<DataTable
  tableId="org-chart"
  data={employees}
  columns={columns}
  enableExpanding={true}
  getSubRows={(row) => row.subordinates}  // Nested data accessor
/>
```

### Aggregation

**Aggregate values in grouped rows:**

```tsx
import {
  aggregationFunctions,
  createAggregatedCellRenderer,
} from '@repo/ui/data-table';

const columns: ColumnDef<Sale>[] = [
  {
    id: 'category',
    accessorKey: 'category',
    header: 'Category',
    enableGrouping: true,
  },
  {
    id: 'revenue',
    accessorKey: 'amount',
    header: 'Revenue',
    enableGrouping: false,
    aggregationFn: aggregationFunctions.sum,  // Sum amounts in group
    aggregatedCell: createAggregatedCellRenderer('sum', '$'),  // "$1,234"
  },
  {
    id: 'count',
    header: 'Count',
    aggregationFn: aggregationFunctions.count,
    aggregatedCell: createAggregatedCellRenderer('count'),  // "5 items"
  },
  {
    id: 'avgPrice',
    accessorKey: 'price',
    header: 'Avg Price',
    aggregationFn: aggregationFunctions.average,
    aggregatedCell: createAggregatedCellRenderer('average', '$'),  // "$123.45"
  },
];
```

**Available aggregation functions:**
- `sum` - Add all numeric values
- `count` - Count rows in group
- `average` / `mean` - Calculate average
- `min` - Find minimum value
- `max` - Find maximum value
- `median` - Calculate median
- `unique` - Get unique values array
- `uniqueCount` - Count unique values
- `extent` - Get [min, max] tuple

### Inline Editing

**Enable cell editing:**

```tsx
const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    meta: {
      editable: true,
      editType: 'text',
    },
  },
  {
    id: 'age',
    accessorKey: 'age',
    header: 'Age',
    meta: {
      editable: true,
      editType: 'number',
      min: 0,
      max: 120,
    },
  },
  {
    id: 'active',
    accessorKey: 'active',
    header: 'Active',
    meta: {
      editable: true,
      editType: 'checkbox',
    },
  },
];

<DataTable
  tableId="users"
  data={users}
  columns={columns}
  enableInlineEditing={true}
  onEditCell={async (params) => {
    // Save to backend
    await updateUser(params.row.original.id, {
      [params.column.id]: params.value
    });
  }}
  getRowCanEdit={(row) => row.original.role !== 'admin'}  // Conditional editing
/>
```

### Row Selection

**Single or multiple row selection:**

```tsx
<DataTable
  tableId="users"
  data={users}
  columns={columns}
  selectionMode="multiple"  // 'single' | 'multiple' | 'none'
  onRowSelectionChange={(selectedRows) => {
    console.log('Selected:', selectedRows);
  }}
/>
```

### Bulk Actions

**Actions for multiple selected rows:**

```tsx
import type { BulkAction } from '@repo/ui/data-table';

const bulkActions: BulkAction<User>[] = [
  {
    id: 'delete',
    label: 'Delete Selected',
    icon: <TrashIcon />,
    variant: 'destructive',
    action: async (rows) => {
      const ids = rows.map(r => r.id);
      await deleteUsers(ids);
    },
  },
  {
    id: 'export',
    label: 'Export to CSV',
    icon: <DownloadIcon />,
    action: async (rows) => {
      exportToCSV(rows);
    },
  },
];

<DataTable
  tableId="users"
  data={users}
  columns={columns}
  selectionMode="multiple"
  bulkActions={bulkActions}
/>
```

### Server-Side Data

**Fetch data from server with pagination, sorting, and filtering:**

```tsx
import { useServerData } from '@repo/ui/data-table';

function ServerTable() {
  const { data, loading, error, totalCount } = useServerData<User>({
    url: '/api/users',
    initialPageSize: 10,
  });

  return (
    <DataTable
      tableId="users-server"
      data={data}
      columns={columns}
      totalCount={totalCount}
      serverSide={true}
      loading={loading}
      error={error}
    />
  );
}
```

**Custom server integration:**

```tsx
const [data, setData] = useState<User[]>([]);
const [loading, setLoading] = useState(false);
const [totalCount, setTotalCount] = useState(0);

<DataTable
  tableId="users-custom"
  data={data}
  columns={columns}
  totalCount={totalCount}
  serverSide={true}
  loading={loading}
  onPaginationChange={(state) => {
    fetchUsers(state.pageIndex, state.pageSize);
  }}
  onSortingChange={(state) => {
    fetchUsers(0, 10, state);
  }}
  onFilteringChange={(state) => {
    fetchUsers(0, 10, undefined, state);
  }}
/>
```

---

## UI Customization

### Density Control

**Control table spacing and text size:**

```tsx
// Uncontrolled (user controls via toolbar)
<DataTable tableId="users" data={users} columns={columns} />

// Controlled (you control density)
const [density, setDensity] = useState<'compact' | 'default' | 'relaxed'>('default');
<DataTable
  tableId="users"
  data={users}
  columns={columns}
  density={density}
  onDensityChange={setDensity}
/>
```

**Density options:**
- `compact` - Smaller text, tight spacing
- `default` - Normal spacing
- `relaxed` - Larger text, loose spacing

### Filter Modes

**Control how column filters are displayed:**

```tsx
// Uncontrolled (user controls via toolbar)
<DataTable tableId="products" data={products} columns={columns} />

// Controlled
const [filterMode, setFilterMode] = useState<'inline' | 'popover'>('inline');
<DataTable
  tableId="products"
  data={products}
  columns={columns}
  filterMode={filterMode}
  onFilterModeChange={setFilterMode}
/>
```

**Filter modes:**
- `inline` - Filters appear below column headers
- `popover` - Filters in dropdown menu

### Sticky Headers & Columns

**Keep headers and columns visible while scrolling:**

```tsx
<DataTable
  tableId="large-table"
  data={data}
  columns={columns}
  stickyHeader={true}  // Keep header visible on vertical scroll
  stickyColumns={{
    left: 2,   // Keep first 2 columns sticky on horizontal scroll
    right: 1,  // Keep last column sticky
  }}
/>
```

### Variants

**Different table styles:**

```tsx
<DataTable
  tableId="users"
  data={users}
  columns={columns}
  variant="default"  // 'default' | 'bordered' | 'striped'
/>
```

---

## API Reference

### DataTable Props

```typescript
interface DataTableProps<TData> {
  // Required
  tableId: string;                          // Unique ID for persistence
  data: TData[];                            // Table data
  columns: ColumnDef<TData>[];             // Column definitions
  
  // Pagination
  totalCount?: number;                      // Total rows (for server-side)
  initialPageSize?: number;                 // Default: 10
  pageSizeOptions?: number[];              // Default: [10, 25, 50, 100]
  
  // Initial State
  initialSortingState?: SortingState;
  initialColumnVisibility?: ColumnVisibilityState;
  initialColumnOrder?: string[];
  initialColumnSizing?: ColumnSizingState;
  initialColumnPinning?: ColumnPinningState;
  initialGrouping?: string[];
  initialExpanded?: ExpandedState;
  
  // Feature Toggles
  enableSorting?: boolean;                  // Default: true
  enableFiltering?: boolean;                // Default: true
  enableGlobalFilter?: boolean;             // Default: true
  enableColumnFilters?: boolean;            // Default: true
  enableColumnVisibility?: boolean;         // Default: true
  enablePagination?: boolean;               // Default: true
  enableRowSelection?: boolean;             // Default: false
  enableColumnResizing?: boolean;           // Default: true
  enableColumnReordering?: boolean;         // Default: true
  enableColumnPinning?: boolean;            // Default: true
  enableGrouping?: boolean;                 // Default: false
  enableExpanding?: boolean;                // Default: false
  enableInlineEditing?: boolean;            // Default: false
  enablePersistence?: boolean;              // Default: true
  
  // Selection
  selectionMode?: 'single' | 'multiple' | 'none';  // Default: 'none'
  
  // Server-Side
  serverSide?: boolean;                     // Default: false
  loading?: boolean;
  error?: Error | null;
  
  // Messages
  emptyMessage?: string;                    // Default: "No data available"
  loadingMessage?: string;                  // Default: "Loading..."
  errorMessage?: string;                    // Default: "Error loading data"
  
  // Callbacks
  onPaginationChange?: (state: PaginationState) => void;
  onSortingChange?: (state: SortingState) => void;
  onFilteringChange?: (state: ColumnFiltersState) => void;
  onRowSelectionChange?: (rows: TData[]) => void;
  onEditCell?: (params: EditCellParams<TData>) => Promise<void> | void;
  onColumnOrderChange?: (columnIds: string[]) => void;
  onColumnPinningChange?: (pinning: ColumnPinningState) => void;
  onGroupingChange?: (grouping: GroupingState) => void;
  onExpandedChange?: (expanded: ExpandedState) => void;
  
  // Editing
  getRowCanEdit?: (row: TData) => boolean;
  
  // Actions
  rowActions?: RowAction<TData>[];
  bulkActions?: BulkAction<TData>[];
  
  // UI State (Controlled/Uncontrolled)
  density?: 'compact' | 'default' | 'relaxed';
  onDensityChange?: (density: Density) => void;
  filterMode?: 'inline' | 'popover';
  onFilterModeChange?: (mode: FilterMode) => void;
  
  // UI Options
  stickyHeader?: boolean;
  stickyColumns?: { left?: number; right?: number };
  variant?: 'default' | 'bordered' | 'striped';
  className?: string;
  
  // Expanding
  getSubRows?: (row: TData) => TData[] | undefined;
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
  getRowCanExpand?: (row: Row<TData>) => boolean;
  
  // Aggregation
  aggregationFns?: Record<string, AggregationFn<any>>;
}
```

### Column Definition

```typescript
interface ColumnDef<TData> {
  // Identity
  id: string;                               // Required unique ID
  accessorKey?: keyof TData;                // Property name
  accessorFn?: (row: TData) => any;        // Custom accessor
  
  // Display
  header: string | ((props) => ReactNode);
  cell?: (props) => ReactNode;
  footer?: string | ((props) => ReactNode);
  
  // Sizing
  size?: number;                            // Default width
  minSize?: number;                         // Min width (default: 50)
  maxSize?: number;                         // Max width (default: 500)
  
  // Features
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableGrouping?: boolean;
  enableColumnFilter?: boolean;
  enableGlobalFilter?: boolean;
  enableResizing?: boolean;
  enablePinning?: boolean;
  
  // Filtering
  filterFn?: FilterFn;
  
  // Grouping & Aggregation
  aggregationFn?: AggregationFn;
  aggregatedCell?: (props) => ReactNode;
  
  // Editing
  meta?: {
    editable?: boolean;
    editType?: 'text' | 'number' | 'email' | 'checkbox' | 'select' | 'custom';
    editComponent?: React.ComponentType<EditComponentProps<TData>>;
    min?: number;
    max?: number;
    step?: number;
    options?: Array<{ label: string; value: any }>;
  };
}
```

---

## Troubleshooting

### My table state isn't persisting

**Solution**: Ensure you're providing a `tableId` prop:

```tsx
// ❌ Missing tableId - no persistence
<DataTable data={users} columns={columns} />

// ✅ With tableId - persistence enabled
<DataTable tableId="users-table" data={users} columns={columns} />
```

### Multiple tables are sharing state

**Solution**: Use **unique tableIds** for each table:

```tsx
// ❌ Same tableId - will share state
<DataTable tableId="table" data={users} columns={userColumns} />
<DataTable tableId="table" data={products} columns={productColumns} />

// ✅ Unique tableIds - separate state
<DataTable tableId="users-table" data={users} columns={userColumns} />
<DataTable tableId="products-table" data={products} columns={productColumns} />
```

### State not clearing during development

**Solution**: Manually clear localStorage:

```typescript
// Clear specific table
localStorage.removeItem('oneportal-datatable-users-table-state');

// Clear all DataTable state
Object.keys(localStorage)
  .filter(key => key.startsWith('oneportal-datatable-'))
  .forEach(key => localStorage.removeItem(key));
```

### Filters not working

**Solutions**:

1. Ensure filtering is enabled:
```tsx
<DataTable enableFiltering={true} enableColumnFilters={true} {...props} />
```

2. Add `filterFn` to columns:
```tsx
const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    filterFn: defaultTextFilter,  // Add filter function
  },
];
```

### Server-side pagination not working

**Solution**: Ensure you're handling callbacks:

```tsx
<DataTable
  serverSide={true}
  totalCount={totalCount}  // Must provide total count
  onPaginationChange={(state) => {
    // Fetch new page
    fetchData(state.pageIndex, state.pageSize);
  }}
  {...props}
/>
```

### Grouping not showing aggregated values

**Solution**: Add `aggregationFn` and `aggregatedCell` to columns:

```tsx
const columns: ColumnDef<Sale>[] = [
  {
    id: 'amount',
    accessorKey: 'amount',
    header: 'Amount',
    aggregationFn: aggregationFunctions.sum,  // Add aggregation
    aggregatedCell: createAggregatedCellRenderer('sum', '$'),
  },
];
```

---

## Migration Guide

### From Plain TanStack Table

If you're migrating from a custom TanStack Table implementation:

**Before:**
```tsx
import { useReactTable } from '@tanstack/react-table';

function MyTable() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // ... manual state management
  });
  
  // ... custom table rendering
}
```

**After:**
```tsx
import { DataTable } from '@repo/ui/data-table';

function MyTable() {
  return (
    <DataTable
      tableId="my-table"  // Automatic persistence
      data={data}
      columns={columns}
      // All features built-in
    />
  );
}
```

### Key Changes

1. **State Management**: No need to manage state manually - DataTable handles it
2. **Persistence**: Automatic with `tableId` prop
3. **UI Components**: Built-in toolbar, pagination, filters, etc.
4. **Type Safety**: Full TypeScript support with generics

---

## Performance Tips

1. **Memoize data and columns**:
```tsx
const data = useMemo(() => users, [users]);
const columns = useMemo<ColumnDef<User>[]>(() => [...], []);
```

2. **Use server-side mode for large datasets**:
```tsx
<DataTable serverSide={true} totalCount={10000} {...props} />
```

3. **Disable unused features**:
```tsx
<DataTable
  enableGrouping={false}
  enableExpanding={false}
  {...props}
/>
```

4. **Use unique `tableId` for each table** to avoid state conflicts

---

## Related Documentation

- [PERSISTENCE.md](./PERSISTENCE.md) - Detailed persistence mechanism
- [TanStack Table Docs](https://tanstack.com/table/v8) - Underlying library
- [Type Definitions](./types.ts) - Full TypeScript interfaces

---

## License

MIT
