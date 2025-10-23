/**
 * DataTable Selection & Actions Stories
 *
 * Demonstrates row selection and action capabilities:
 * - Single row selection (radio buttons)
 * - Multiple row selection (checkboxes)
 * - Per-row action menus
 * - Bulk actions for selected rows
 * - Conditional actions based on row state
 * - Disabled selection for specific rows
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DataTable } from "@one-portal/ui";
import type { RowAction, BulkAction } from "@one-portal/ui";
import { Trash2, Edit, Copy, Send, Archive, CheckCircle } from "lucide-react";
import { generateUsers, generateOrders } from "../../mocks/data-generators";
import { userColumns, orderColumns } from "../../mocks/column-definitions";
import type { User, Order } from "../../mocks/data-generators";

// Generate mock data
const users = generateUsers(50);
const orders = generateOrders(100);

const meta: Meta<typeof DataTable> = {
  title: "DataTable/04 - Selection & Actions",
  component: DataTable,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Row selection and action features including single/multiple selection, per-row actions, and bulk operations.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

/**
 * Single Row Selection - Radio button selection mode.
 * Only one row can be selected at a time.
 */
export const SingleRowSelection: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = useState<User[]>([]);

    return (
      <div className="space-y-4">
        <DataTable
          tableId="selection-single"
          data={users.slice(0, 20)}
          columns={userColumns}
          selectionMode="single"
          onRowSelectionChange={setSelectedRows}
          enableSorting
          enablePagination
          initialPageSize={10}
        />
        {selectedRows.length > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">Selected User:</p>
            <p className="text-sm text-muted-foreground">
              {selectedRows[0]?.name} ({selectedRows[0]?.email})
            </p>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Single row selection uses radio buttons. Only one row can be selected at a time. Use selectionMode="single" prop.',
      },
    },
  },
};

/**
 * Multiple Row Selection - Checkbox selection mode.
 * Multiple rows can be selected simultaneously.
 */
export const MultipleRowSelection: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = useState<User[]>([]);

    return (
      <div className="space-y-4">
        <DataTable
          tableId="selection-multiple"
          data={users.slice(0, 20)}
          columns={userColumns}
          selectionMode="multiple"
          onRowSelectionChange={setSelectedRows}
          enableSorting
          enablePagination
          initialPageSize={10}
        />
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">
            Selected {selectedRows.length} row(s)
          </p>
          {selectedRows.length > 0 && (
            <ul className="mt-2 text-sm text-muted-foreground">
              {selectedRows.slice(0, 5).map((row) => (
                <li key={row.id}>
                  {row.name} - {row.role}
                </li>
              ))}
              {selectedRows.length > 5 && (
                <li>... and {selectedRows.length - 5} more</li>
              )}
            </ul>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Multiple row selection uses checkboxes. Select multiple rows with individual checkboxes or use the header checkbox to select all. Use selectionMode="multiple" prop.',
      },
    },
  },
};

/**
 * Row Actions - Per-row action menu.
 * Each row has its own action buttons.
 */
export const RowActions: Story = {
  render: () => {
    const [data, setData] = useState(users.slice(0, 20));

    const rowActions: RowAction<User>[] = [
      {
        id: "edit",
        label: "Edit",
        icon: <Edit className="h-4 w-4" />,
        onClick: (row) => {
          console.log("Edit user:", row);
          alert(`Edit user: ${row.name}`);
        },
        variant: "default",
      },
      {
        id: "copy",
        label: "Duplicate",
        icon: <Copy className="h-4 w-4" />,
        onClick: (row) => {
          console.log("Duplicate user:", row);
          const newUser = {
            ...row,
            id: `${row.id}-copy`,
            name: `${row.name} (Copy)`,
          };
          setData((prev) => [...prev, newUser]);
        },
        variant: "outline",
      },
      {
        id: "delete",
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row) => {
          if (confirm(`Delete ${row.name}?`)) {
            setData((prev) => prev.filter((u) => u.id !== row.id));
          }
        },
        variant: "destructive",
        disabled: (row) => row.status === "Active", // Can't delete active users
      },
    ];

    return (
      <DataTable
        tableId="row-actions"
        data={data}
        columns={userColumns}
        rowActions={rowActions}
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
          "Per-row actions appear as buttons in an actions column. Define actions with onClick handlers, icons, and conditional disabling. Delete is disabled for Active users.",
      },
    },
  },
};

/**
 * Bulk Actions - Operations on multiple selected rows.
 * Bulk action buttons appear when rows are selected.
 */
export const BulkActions: Story = {
  render: () => {
    const [data, setData] = useState(orders.slice(0, 30));
    const [selectedRows, setSelectedRows] = useState<Order[]>([]);

    const bulkActions: BulkAction<Order>[] = [
      {
        id: "archive",
        label: "Archive",
        icon: <Archive className="h-4 w-4" />,
        onClick: (rows) => {
          console.log("Archive orders:", rows);
          alert(`Archived ${rows.length} order(s)`);
          setData((prev) =>
            prev.filter((o) => !rows.find((r) => r.id === o.id)),
          );
          setSelectedRows([]);
        },
        variant: "outline",
      },
      {
        id: "mark-shipped",
        label: "Mark as Shipped",
        icon: <Send className="h-4 w-4" />,
        onClick: (rows) => {
          console.log("Mark as shipped:", rows);
          setData((prev) =>
            prev.map((order) =>
              rows.find((r) => r.id === order.id)
                ? { ...order, status: "Shipped" as const }
                : order,
            ),
          );
          setSelectedRows([]);
        },
        variant: "default",
        disabled: (rows) => rows.some((r) => r.status === "Cancelled"),
      },
      {
        id: "delete",
        label: "Delete Selected",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (rows) => {
          if (confirm(`Delete ${rows.length} order(s)?`)) {
            setData((prev) =>
              prev.filter((o) => !rows.find((r) => r.id === o.id)),
            );
            setSelectedRows([]);
          }
        },
        variant: "destructive",
        minSelection: 1,
      },
    ];

    return (
      <div className="space-y-4">
        <DataTable
          tableId="bulk-actions"
          data={data}
          columns={orderColumns}
          selectionMode="multiple"
          onRowSelectionChange={setSelectedRows}
          bulkActions={bulkActions}
          enableSorting
          enablePagination
          initialPageSize={15}
        />
        {selectedRows.length > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              {selectedRows.length} order(s) selected
            </p>
            <p className="text-sm text-muted-foreground">
              Total amount: $
              {selectedRows.reduce((sum, o) => sum + o.amount, 0).toFixed(2)}
            </p>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Bulk actions appear in the toolbar when rows are selected. Define actions that operate on multiple rows. "Mark as Shipped" is disabled when cancelled orders are selected.',
      },
    },
  },
};

/**
 * Conditional Actions - Actions that change based on row state.
 * Different actions available based on order status.
 */
export const ConditionalActions: Story = {
  render: () => {
    const [data, setData] = useState(orders.slice(0, 20));

    const rowActions: RowAction<Order>[] = [
      {
        id: "view",
        label: "View Details",
        onClick: (row) => {
          alert(
            `Order: ${row.orderNumber}\nStatus: ${row.status}\nAmount: $${row.amount}`,
          );
        },
        variant: "outline",
      },
      {
        id: "approve",
        label: "Approve",
        icon: <CheckCircle className="h-4 w-4" />,
        onClick: (row) => {
          setData((prev) =>
            prev.map((o) =>
              o.id === row.id ? { ...o, status: "Processing" as const } : o,
            ),
          );
        },
        variant: "default",
        hidden: (row) => row.status !== "Pending",
      },
      {
        id: "ship",
        label: "Mark Shipped",
        icon: <Send className="h-4 w-4" />,
        onClick: (row) => {
          setData((prev) =>
            prev.map((o) =>
              o.id === row.id ? { ...o, status: "Shipped" as const } : o,
            ),
          );
        },
        variant: "default",
        hidden: (row) => row.status !== "Processing",
      },
      {
        id: "cancel",
        label: "Cancel Order",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row) => {
          if (confirm(`Cancel order ${row.orderNumber}?`)) {
            setData((prev) =>
              prev.map((o) =>
                o.id === row.id ? { ...o, status: "Cancelled" as const } : o,
              ),
            );
          }
        },
        variant: "destructive",
        hidden: (row) => ["Delivered", "Cancelled"].includes(row.status),
      },
    ];

    return (
      <DataTable
        tableId="conditional-actions"
        data={data}
        columns={orderColumns}
        rowActions={rowActions}
        enableSorting
        enableFiltering
        enablePagination
        initialPageSize={10}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Conditional actions show/hide based on row state. Pending orders show "Approve", Processing orders show "Mark Shipped", and completed orders hide cancellation.',
      },
    },
  },
};

/**
 * Disabled Selection - Some rows cannot be selected.
 * Certain rows are non-selectable based on conditions.
 */
export const DisabledSelection: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = useState<User[]>([]);

    return (
      <div className="space-y-4">
        <DataTable
          tableId="disabled-selection"
          data={users.slice(0, 20)}
          columns={userColumns}
          selectionMode="multiple"
          onRowSelectionChange={setSelectedRows}
          getRowCanSelect={(row) => row.status !== "Inactive"} // Inactive users can't be selected
          enableSorting
          enablePagination
          initialPageSize={10}
        />
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">
            Selected {selectedRows.length} active user(s)
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Note: Inactive users cannot be selected
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Disable selection for specific rows using getRowCanSelect. Inactive users cannot be selected in this example. Disabled rows show grayed-out checkboxes.",
      },
    },
  },
};
