/**
 * DataTable V2 - Sorting Stories
 *
 * Tests sorting functionality: single column, multi-column, custom sort
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable, type ColumnDef } from "@one-portal/ui/data-table-v2";

// Sample data type
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
}

// Sample data
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Laptop Pro",
    category: "Electronics",
    price: 1299.99,
    stock: 15,
    rating: 4.5,
  },
  {
    id: "2",
    name: "Wireless Mouse",
    category: "Accessories",
    price: 29.99,
    stock: 150,
    rating: 4.2,
  },
  {
    id: "3",
    name: "USB-C Cable",
    category: "Accessories",
    price: 12.99,
    stock: 500,
    rating: 4.0,
  },
  {
    id: "4",
    name: 'Monitor 27"',
    category: "Electronics",
    price: 449.99,
    stock: 30,
    rating: 4.7,
  },
  {
    id: "5",
    name: "Keyboard Mechanical",
    category: "Accessories",
    price: 89.99,
    stock: 75,
    rating: 4.6,
  },
  {
    id: "6",
    name: "Desk Lamp LED",
    category: "Office",
    price: 39.99,
    stock: 200,
    rating: 4.3,
  },
  {
    id: "7",
    name: "Notebook A4",
    category: "Office",
    price: 5.99,
    stock: 1000,
    rating: 3.8,
  },
  {
    id: "8",
    name: "Webcam HD",
    category: "Electronics",
    price: 79.99,
    stock: 45,
    rating: 4.1,
  },
];

// Column definitions
const columns: ColumnDef<Product>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Product Name",
  },
  {
    id: "category",
    accessorKey: "category",
    header: "Category",
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
  },
  {
    id: "stock",
    accessorKey: "stock",
    header: "Stock",
  },
  {
    id: "rating",
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <span>{row.original.rating.toFixed(1)}</span>
        <svg
          className="h-4 w-4 text-yellow-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </div>
    ),
  },
];

const meta = {
  title: "DataTable V2/02-Sorting",
  component: DataTable,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Default Sorting Enabled**
 *
 * All columns sortable by default. Click column headers to sort.
 * Click again to toggle between ascending, descending, and unsorted.
 */
export const DefaultSorting: Story = {
  args: {
    data: sampleProducts,
    columns,
  },
};

/**
 * **Initial Sort State**
 *
 * Table starts sorted by price (ascending).
 */
export const InitialSortState: Story = {
  args: {
    data: sampleProducts,
    columns,
    features: {
      sorting: {
        enabled: true,
        initialState: [{ id: "price", desc: false }],
      },
    },
  },
};

/**
 * **Multi-Column Sorting**
 *
 * Hold Shift and click multiple column headers to sort by multiple columns.
 * First column is primary sort, second is secondary, etc.
 */
export const MultiColumnSorting: Story = {
  args: {
    data: sampleProducts,
    columns,
    features: {
      sorting: {
        enabled: true,
        multi: true,
        initialState: [
          { id: "category", desc: false },
          { id: "price", desc: true },
        ],
      },
    },
  },
};

/**
 * **Sorting Disabled**
 *
 * No sort indicators shown, headers not clickable.
 */
export const SortingDisabled: Story = {
  args: {
    data: sampleProducts,
    columns,
    features: {
      sorting: false,
    },
  },
};

/**
 * **Selective Column Sorting**
 *
 * Only some columns allow sorting.
 * Product name and price are sortable, others are not.
 */
export const SelectiveColumnSorting: Story = {
  args: {
    data: sampleProducts,
    columns: [
      {
        id: "name",
        accessorKey: "name",
        header: "Product Name",
        enableSorting: true,
      },
      {
        id: "category",
        accessorKey: "category",
        header: "Category",
        enableSorting: false,
      },
      {
        id: "price",
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
        enableSorting: true,
      },
      {
        id: "stock",
        accessorKey: "stock",
        header: "Stock",
        enableSorting: false,
      },
      {
        id: "rating",
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <span>{row.original.rating.toFixed(1)}</span>
            <svg
              className="h-4 w-4 text-yellow-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
        ),
        enableSorting: false,
      },
    ] as ColumnDef<Product>[],
  },
};

/**
 * **Custom Sort Function**
 *
 * Rating column uses custom sort logic to handle edge cases.
 */
export const CustomSortFunction: Story = {
  args: {
    data: sampleProducts,
    columns: [
      {
        id: "name",
        accessorKey: "name",
        header: "Product Name",
      },
      {
        id: "category",
        accessorKey: "category",
        header: "Category",
      },
      {
        id: "price",
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
      },
      {
        id: "stock",
        accessorKey: "stock",
        header: "Stock",
      },
      {
        id: "rating",
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <span>{row.original.rating.toFixed(1)}</span>
            <svg
              className="h-4 w-4 text-yellow-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
        ),
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue(columnId) as number;
          const b = rowB.getValue(columnId) as number;
          // Custom sort: prioritize higher ratings
          return a - b;
        },
      },
    ] as ColumnDef<Product>[],
  },
};
