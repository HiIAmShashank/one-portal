/**
 * DataTable Column Features Stories
 *
 * Demonstrates column manipulation capabilities:
 * - Column resizing
 * - Column reordering (drag & drop)
 * - Column pinning (left/right)
 * - Column visibility toggle
 * - Sticky columns (fixed while scrolling)
 * - Sticky header (fixed on scroll)
 * - Custom cell renderers
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable } from "@one-portal/ui";
import { generateUsers, generateOrders } from "../../mocks/data-generators";
import { userColumns, orderColumns } from "../../mocks/column-definitions";

// Generate mock data
const users = generateUsers(50);
const orders = generateOrders(100);

const meta: Meta<typeof DataTable> = {
  title: "DataTable/03 - Column Features",
  component: DataTable,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Column manipulation features including resizing, reordering, pinning, visibility control, and sticky behavior.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

/**
 * Column Resizing - Drag column borders to adjust width.
 * Resize handles appear on column borders when hovering.
 */
export const ColumnResizing: Story = {
  args: {
    tableId: "column-resizing",
    data: users,
    columns: userColumns,
    enableColumnResizing: true,
    enableSorting: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Drag column borders to resize columns. Widths are automatically persisted to localStorage. Double-click border to auto-fit content.",
      },
    },
  },
};

/**
 * Column Reordering - Drag & drop columns to reorder.
 * Click and drag column headers to rearrange.
 */
export const ColumnReordering: Story = {
  args: {
    tableId: "column-reordering",
    data: users,
    columns: userColumns,
    enableColumnReordering: true,
    enableSorting: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Drag column headers to reorder columns. New order is persisted to localStorage. Visual feedback shows drop zones during drag.",
      },
    },
  },
};

/**
 * Column Pinning - Pin columns to left or right edge.
 * Use column menu to pin/unpin columns.
 */
export const ColumnPinning: Story = {
  args: {
    tableId: "column-pinning",
    data: users,
    columns: userColumns,
    enableColumnPinning: true,
    enableSorting: true,
    enablePagination: true,
    enableColumnResizing: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pin columns to left or right edge. Pinned columns remain visible while scrolling horizontally. Use the column menu to pin/unpin.",
      },
    },
  },
};

/**
 * Column Visibility - Show/hide columns via toggle.
 * Use toolbar dropdown to toggle column visibility.
 */
export const ColumnVisibility: Story = {
  args: {
    tableId: "column-visibility",
    data: users,
    columns: userColumns,
    enableColumnVisibility: true,
    enableSorting: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Toggle column visibility using the toolbar dropdown. Hidden columns are saved to localStorage. Useful for customizing views.",
      },
    },
  },
};

/**
 * Sticky Columns - First and last columns fixed while scrolling.
 * First 2 columns and last 1 column remain visible during horizontal scroll.
 */
export const StickyColumns: Story = {
  args: {
    tableId: "sticky-columns",
    data: users,
    columns: userColumns,
    stickyColumns: {
      left: 2, // Avatar and Name columns
      right: 1, // Created column
    },
    enableSorting: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Sticky columns remain fixed while scrolling horizontally. First 2 columns (Avatar, Name) and last column (Created) stay visible. Great for wide tables.",
      },
    },
  },
};

/**
 * Sticky Header - Header remains visible while scrolling vertically.
 * Scroll down to see the header stick to the top.
 */
export const StickyHeader: Story = {
  args: {
    tableId: "sticky-header",
    data: users,
    columns: userColumns,
    stickyHeader: true,
    enableSorting: true,
    enablePagination: false, // Show all rows to enable scrolling
  },
  parameters: {
    docs: {
      description: {
        story:
          "Sticky header remains fixed at the top while scrolling vertically. Useful for long tables where context is needed.",
      },
    },
  },
};

/**
 * Custom Cell Renderers - Rich content with icons, badges, and formatting.
 * Demonstrates various custom renderers: avatars, badges, formatted dates/currency.
 */
export const CustomCellRenderers: Story = {
  args: {
    tableId: "custom-renderers",
    data: orders.slice(0, 20),
    columns: orderColumns,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Custom cell renderers display rich content: Badge components for status, formatted currency, date formatting, and more. Defined in column definitions.",
      },
    },
  },
};

/**
 * All Column Features Combined - Full column control.
 * Demonstrates all column features working together.
 */
export const AllColumnFeatures: Story = {
  args: {
    tableId: "column-features-combined",
    data: users,
    columns: userColumns,
    enableColumnResizing: true,
    enableColumnReordering: true,
    enableColumnPinning: true,
    enableColumnVisibility: true,
    stickyHeader: true,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          "All column features enabled: resize, reorder, pin, hide/show, sticky header. Try combining features for a fully customizable table.",
      },
    },
  },
};
