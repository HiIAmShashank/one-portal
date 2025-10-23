/**
 * DataTable Advanced Features Stories
 *
 * Demonstrates advanced DataTable capabilities:
 * - Inline cell editing
 * - Row grouping with aggregation
 * - Expandable rows
 * - Server-side data operations
 * - Multi-select filters
 * - Custom aggregations
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DataTable } from "@one-portal/ui";
import type { EditCellParams } from "@one-portal/ui";
import { generateProducts, generateOrders } from "../../mocks/data-generators";
import { productColumns, orderColumns } from "../../mocks/column-definitions";

// Generate mock data
const products = generateProducts(75);
const orders = generateOrders(100);

const meta: Meta<typeof DataTable> = {
  title: "DataTable/02 - Advanced Features",
  component: DataTable,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Advanced DataTable features including inline editing, row grouping, expandable rows, and server-side operations.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

/**
 * Inline Editing - Edit cells directly in the table.
 * Double-click or click edit icon to modify values.
 */
export const InlineEditing: Story = {
  render: () => {
    const [data, setData] = useState(products.slice(0, 20));

    const handleEditCell = async (
      params: EditCellParams<(typeof products)[0]>,
    ) => {
      console.log("Cell edited:", params);

      // Update the data
      setData((prev) =>
        prev.map((item) =>
          item.id === params.row.id
            ? { ...item, [params.columnId]: params.newValue }
            : item,
        ),
      );

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
    };

    return (
      <DataTable
        tableId="advanced-inline-editing"
        data={data}
        columns={productColumns}
        enableInlineEditing
        onEditCell={handleEditCell}
        enableSorting
        enablePagination
        initialPageSize={10}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Inline editing allows users to modify cell values directly. Editable columns are marked with column definition `editable: true`. Supports text, number, select, and other input types.",
      },
    },
  },
};

/**
 * Row Grouping - Group rows by column values with aggregation.
 * Groups automatically aggregate numeric columns.
 */
export const RowGrouping: Story = {
  args: {
    tableId: "advanced-grouping",
    data: orders,
    columns: orderColumns,
    enableGrouping: true,
    initialGrouping: ["status"],
    enableSorting: true,
    enablePagination: true,
    initialPageSize: 20,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Row grouping organizes data by column values. Numeric columns (amount, items) show aggregated totals. Click group headers to expand/collapse.",
      },
    },
  },
};

/**
 * Row Expanding - Expandable rows showing nested details.
 * Click expand icon to reveal additional row information.
 */
export const RowExpanding: Story = {
  render: () => {
    // Create hierarchical data structure
    const expandableOrders = orders.slice(0, 20).map((order) => ({
      ...order,
      // Add subrows with order items
      subRows: [
        {
          id: `${order.id}-item-1`,
          orderNumber: `Item 1`,
          customer: "Product A",
          amount: order.amount * 0.4,
          status: order.status,
          items: 1,
          date: order.date,
        },
        {
          id: `${order.id}-item-2`,
          orderNumber: `Item 2`,
          customer: "Product B",
          amount: order.amount * 0.6,
          status: order.status,
          items: 1,
          date: order.date,
        },
      ],
    }));

    return (
      <DataTable
        tableId="advanced-expanding"
        data={expandableOrders}
        columns={orderColumns}
        enableExpanding
        getSubRows={(row: any) => row.subRows}
        enableSorting
        enablePagination
        initialPageSize={10}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Expandable rows reveal nested data. Useful for master-detail views, hierarchical data, or showing additional information on demand.",
      },
    },
  },
};

/**
 * Server-Side Mode - Pagination, sorting, and filtering handled by server.
 * Simulates API calls with loading states.
 */
export const ServerSideMode: Story = {
  render: () => {
    const [data, setData] = useState(products.slice(0, 10));
    const [loading, setLoading] = useState(false);
    const [totalCount] = useState(products.length);

    const handlePaginationChange = async (state: any) => {
      console.log("Pagination changed:", state);
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const start = state.pageIndex * state.pageSize;
      const end = start + state.pageSize;
      setData(products.slice(start, end));
      setLoading(false);
    };

    const handleSortingChange = async (state: any) => {
      console.log("Sorting changed:", state);
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // In real app, send sort params to server
      setLoading(false);
    };

    return (
      <DataTable
        tableId="advanced-server-side"
        data={data}
        columns={productColumns}
        totalCount={totalCount}
        serverSide
        loading={loading}
        onPaginationChange={handlePaginationChange}
        onSortingChange={handleSortingChange}
        enableSorting
        enablePagination
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Server-side mode delegates data operations to the backend. Useful for large datasets where client-side processing is impractical. Shows loading states during API calls.",
      },
    },
  },
};

/**
 * Multi-Select Filters - Various filter types in action.
 * Demonstrates select, multi-select, number-range, and date-range filters.
 */
export const MultiSelectFilters: Story = {
  args: {
    tableId: "advanced-multi-filters",
    data: orders,
    columns: orderColumns,
    enableFiltering: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    filterMode: "inline",
    enableSorting: true,
    enablePagination: true,
    initialPageSize: 15,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Multiple filter types: multi-select for Status, number-range for Amount, date-range for Order Date. Each filter type is configured via column metadata.",
      },
    },
  },
};

/**
 * Custom Aggregations - Sum, count, and average calculations.
 * Shows aggregated values in grouped rows.
 */
export const CustomAggregations: Story = {
  render: () => {
    // Add custom aggregation columns
    const columnsWithAggregation = orderColumns.map((col) => {
      if (col.id === "amount") {
        return {
          ...col,
          aggregationFn: "sum",
          footer: "Total Amount",
        };
      }
      if (col.id === "items") {
        return {
          ...col,
          aggregationFn: "sum",
          footer: "Total Items",
        };
      }
      return col;
    });

    return (
      <DataTable
        tableId="advanced-aggregations"
        data={orders.slice(0, 50)}
        columns={columnsWithAggregation}
        enableGrouping
        initialGrouping={["status"]}
        enableSorting
        enablePagination
        initialPageSize={20}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Custom aggregations calculate sum, count, average, min, or max for grouped data. Columns define aggregationFn to specify calculation type.",
      },
    },
  },
};
