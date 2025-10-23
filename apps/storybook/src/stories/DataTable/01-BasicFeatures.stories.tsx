/**
 * DataTable Basic Features Stories
 *
 * Demonstrates core DataTable functionality:
 * - Default rendering
 * - Sorting
 * - Pagination
 * - Global search filter
 * - Column filters
 * - Empty/Loading/Error states
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable } from "@one-portal/ui";
import { generateUsers } from "../../mocks/data-generators";
import { userColumns } from "../../mocks/column-definitions";

// Generate mock data
const users = generateUsers(50);

const meta: Meta<typeof DataTable> = {
  title: "DataTable/01 - Basic Features",
  component: DataTable,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Core DataTable features including sorting, pagination, filtering, and state management.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    data: {
      description: "Array of data objects to display",
      control: false,
    },
    columns: {
      description: "Column definitions",
      control: false,
    },
    tableId: {
      description: "Unique identifier for localStorage persistence",
      control: "text",
    },
    enableSorting: {
      description: "Enable column sorting",
      control: "boolean",
    },
    enableFiltering: {
      description: "Enable column filtering",
      control: "boolean",
    },
    enablePagination: {
      description: "Enable pagination controls",
      control: "boolean",
    },
    enableGlobalFilter: {
      description: "Enable global search box",
      control: "boolean",
    },
    initialPageSize: {
      description: "Initial number of rows per page",
      control: "number",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

/**
 * Default DataTable with minimal configuration.
 * Shows basic table rendering with all features disabled.
 */
export const Default: Story = {
  args: {
    tableId: "basic-default",
    data: users,
    columns: userColumns,
    enableSorting: false,
    enableFiltering: false,
    enablePagination: false,
    enableColumnVisibility: false,
    enableColumnResizing: false,
    enableColumnReordering: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Minimal DataTable configuration with all features disabled. Displays data in a simple table format.",
      },
    },
  },
};

/**
 * DataTable with sortable columns.
 * Click column headers to sort ascending/descending.
 */
export const WithSorting: Story = {
  args: {
    tableId: "basic-sorting",
    data: users,
    columns: userColumns,
    enableSorting: true,
    enableFiltering: false,
    enablePagination: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Enable sorting by clicking column headers. Multi-column sorting is supported by holding Shift.",
      },
    },
  },
};

/**
 * DataTable with pagination controls.
 * Navigate through pages and adjust page size.
 */
export const WithPagination: Story = {
  args: {
    tableId: "basic-pagination",
    data: users,
    columns: userColumns,
    enableSorting: false,
    enableFiltering: false,
    enablePagination: true,
    initialPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pagination controls allow navigation through large datasets. Users can customize rows per page.",
      },
    },
  },
};

/**
 * DataTable with global search filter.
 * Searches across all columns simultaneously.
 */
export const WithGlobalFilter: Story = {
  args: {
    tableId: "basic-global-filter",
    data: users,
    columns: userColumns,
    enableSorting: true,
    enableGlobalFilter: true,
    enableFiltering: false,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Global filter searches across all columns. Try searching for names, emails, or departments.",
      },
    },
  },
};

/**
 * DataTable with per-column filters.
 * Each column has its own filter input.
 */
export const WithColumnFilters: Story = {
  args: {
    tableId: "basic-column-filters",
    data: users,
    columns: userColumns,
    enableSorting: true,
    enableFiltering: true,
    enableColumnFilters: true,
    enableGlobalFilter: false,
    enablePagination: true,
    initialPageSize: 10,
    filterMode: "inline",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Column-specific filters provide fine-grained filtering. Role and Status columns have dropdown filters.",
      },
    },
  },
};

/**
 * Empty state - no data available.
 * Shows custom empty message when data array is empty.
 */
export const EmptyState: Story = {
  args: {
    tableId: "basic-empty",
    data: [],
    columns: userColumns,
    enableSorting: true,
    enablePagination: true,
    emptyMessage:
      "No users found. Try adjusting your filters or add new users.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Empty state displays a custom message when no data is available.",
      },
    },
  },
};

/**
 * Loading state - data is being fetched.
 * Shows loading spinner while data is being loaded.
 */
export const LoadingState: Story = {
  args: {
    tableId: "basic-loading",
    data: [],
    columns: userColumns,
    loading: true,
    loadingMessage: "Loading users...",
    enableSorting: true,
    enablePagination: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Loading state displays a spinner and message while data is being fetched from the server.",
      },
    },
  },
};

/**
 * Error state - failed to load data.
 * Shows error message when data fetching fails.
 */
export const ErrorState: Story = {
  args: {
    tableId: "basic-error",
    data: [],
    columns: userColumns,
    error: new Error("Failed to load users from server"),
    errorMessage: "Unable to load users. Please try again later.",
    enableSorting: true,
    enablePagination: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Error state displays a custom error message when data fetching fails.",
      },
    },
  },
};

/**
 * Combined features - sorting, filtering, and pagination.
 * Demonstrates all basic features working together.
 */
export const WithMultipleFeatures: Story = {
  args: {
    tableId: "basic-combined",
    data: users,
    columns: userColumns,
    enableSorting: true,
    enableFiltering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableColumnResizing: true,
    initialPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    filterMode: "inline",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Full-featured DataTable with all basic features enabled. Try combining sorting, filtering, and pagination.",
      },
    },
  },
};
