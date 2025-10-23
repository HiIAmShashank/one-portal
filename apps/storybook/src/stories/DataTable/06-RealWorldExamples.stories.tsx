/**
 * DataTable Real-World Examples Stories
 *
 * Demonstrates complete, production-ready use cases:
 * - User management system
 * - E-commerce order dashboard
 * - Product catalog with editing
 * - Financial data display
 * - Audit log with expandable details
 * - Task management with bulk actions
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DataTable } from "@one-portal/ui";
import type { RowAction, BulkAction, EditCellParams } from "@one-portal/ui";
import {
  Edit,
  Trash2,
  UserCog,
  Mail,
  Archive,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  generateUsers,
  generateOrders,
  generateProducts,
  generateTransactions,
  generateTasks,
} from "../../mocks/data-generators";
import {
  userColumns,
  orderColumns,
  productColumns,
  transactionColumns,
  taskColumns,
} from "../../mocks/column-definitions";
import type { User, Order, Product, Task } from "../../mocks/data-generators";

const meta: Meta<typeof DataTable> = {
  title: "DataTable/06 - Real-World Examples",
  component: DataTable,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Complete, production-ready examples demonstrating real-world use cases with multiple features combined.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

/**
 * User Management - Complete user administration system.
 * Includes selection, filtering, actions, and real-time updates.
 */
export const UserManagement: Story = {
  render: () => {
    const [data, setData] = useState(generateUsers(100));
    const [selectedRows, setSelectedRows] = useState<User[]>([]);

    const rowActions: RowAction<User>[] = [
      {
        id: "edit",
        label: "Edit User",
        icon: <Edit className="h-4 w-4" />,
        onClick: (row) => {
          alert(
            `Edit user: ${row.name}\nEmail: ${row.email}\nRole: ${row.role}`,
          );
        },
      },
      {
        id: "send-email",
        label: "Send Email",
        icon: <Mail className="h-4 w-4" />,
        onClick: (row) => {
          alert(`Sending email to ${row.email}`);
        },
        disabled: (row) => row.status === "Inactive",
      },
      {
        id: "manage-permissions",
        label: "Permissions",
        icon: <UserCog className="h-4 w-4" />,
        onClick: (row) => {
          alert(`Manage permissions for ${row.name}`);
        },
        hidden: (row) => row.role === "Viewer",
      },
      {
        id: "delete",
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row) => {
          if (confirm(`Delete user ${row.name}?`)) {
            setData((prev) => prev.filter((u) => u.id !== row.id));
          }
        },
        variant: "destructive",
        disabled: (row) => row.role === "Admin",
      },
    ];

    const bulkActions: BulkAction<User>[] = [
      {
        id: "activate",
        label: "Activate Users",
        icon: <CheckCircle className="h-4 w-4" />,
        onClick: (rows) => {
          setData((prev) =>
            prev.map((user) =>
              rows.find((r) => r.id === user.id)
                ? { ...user, status: "Active" as const }
                : user,
            ),
          );
          setSelectedRows([]);
        },
      },
      {
        id: "deactivate",
        label: "Deactivate Users",
        icon: <XCircle className="h-4 w-4" />,
        onClick: (rows) => {
          setData((prev) =>
            prev.map((user) =>
              rows.find((r) => r.id === user.id)
                ? { ...user, status: "Inactive" as const }
                : user,
            ),
          );
          setSelectedRows([]);
        },
      },
      {
        id: "bulk-delete",
        label: "Delete Selected",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (rows) => {
          if (confirm(`Delete ${rows.length} user(s)?`)) {
            setData((prev) =>
              prev.filter((u) => !rows.find((r) => r.id === u.id)),
            );
            setSelectedRows([]);
          }
        },
        variant: "destructive",
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">User Management</h2>
            <p className="text-sm text-muted-foreground">
              Manage users, roles, and permissions
            </p>
          </div>
          {selectedRows.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedRows.length} user(s) selected
            </div>
          )}
        </div>
        <DataTable
          tableId="user-management"
          data={data}
          columns={userColumns}
          selectionMode="multiple"
          onRowSelectionChange={setSelectedRows}
          rowActions={rowActions}
          bulkActions={bulkActions}
          enableSorting
          enableFiltering
          enableGlobalFilter
          enableColumnFilters
          enableColumnVisibility
          enableColumnResizing
          enablePagination
          initialPageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Complete user management system with role-based actions, bulk operations, and comprehensive filtering. Delete disabled for Admin users, email disabled for Inactive users.",
      },
    },
  },
};

/**
 * E-Commerce Orders - Order management dashboard.
 * Status tracking, filtering by status/date, and order actions.
 */
export const OrdersTable: Story = {
  render: () => {
    const [data, setData] = useState(generateOrders(200));

    const rowActions: RowAction<Order>[] = [
      {
        id: "view-details",
        label: "View Details",
        onClick: (row) => {
          alert(
            `Order: ${row.orderNumber}\n` +
              `Customer: ${row.customer}\n` +
              `Amount: $${row.amount.toFixed(2)}\n` +
              `Status: ${row.status}\n` +
              `Items: ${row.items}`,
          );
        },
      },
      {
        id: "mark-shipped",
        label: "Mark as Shipped",
        onClick: (row) => {
          setData((prev) =>
            prev.map((o) =>
              o.id === row.id ? { ...o, status: "Shipped" as const } : o,
            ),
          );
        },
        hidden: (row) => !["Pending", "Processing"].includes(row.status),
      },
      {
        id: "cancel",
        label: "Cancel Order",
        icon: <XCircle className="h-4 w-4" />,
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
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Orders Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Track and manage customer orders
          </p>
        </div>
        <DataTable
          tableId="orders-dashboard"
          data={data}
          columns={orderColumns}
          rowActions={rowActions}
          enableSorting
          enableFiltering
          enableGlobalFilter
          enableColumnFilters
          enableGrouping
          initialGrouping={["status"]}
          enablePagination
          initialPageSize={25}
          pageSizeOptions={[10, 25, 50, 100]}
          variant="striped"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "E-commerce order management with status grouping, conditional actions, and comprehensive filtering. Orders grouped by status with aggregated totals.",
      },
    },
  },
};

/**
 * Product Catalog - Editable product inventory.
 * Inline editing, stock management, and real-time updates.
 */
export const ProductCatalog: Story = {
  render: () => {
    const [data, setData] = useState(generateProducts(150));

    const handleEditCell = async (params: EditCellParams<Product>) => {
      console.log("Cell edited:", params);
      setData((prev) =>
        prev.map((item) =>
          item.id === params.row.id
            ? { ...item, [params.columnId]: params.newValue }
            : item,
        ),
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
    };

    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Product Catalog</h2>
          <p className="text-sm text-muted-foreground">
            Manage inventory with inline editing
          </p>
        </div>
        <DataTable
          tableId="product-catalog"
          data={data}
          columns={productColumns}
          enableInlineEditing
          onEditCell={handleEditCell}
          enableSorting
          enableFiltering
          enableGlobalFilter
          enableColumnFilters
          enableColumnVisibility
          enableColumnResizing
          enablePagination
          initialPageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          density="compact"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Product catalog with inline editing for price, stock, and details. Click cells to edit values directly. Compact density for maximum data visibility.",
      },
    },
  },
};

/**
 * Financial Data - Formatted currency and numbers.
 * Transaction history with running balance and filtering.
 */
export const FinancialData: Story = {
  args: {
    tableId: "financial-data",
    data: generateTransactions(100),
    columns: transactionColumns,
    enableSorting: true,
    enableFiltering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enablePagination: true,
    initialPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    variant: "bordered",
  },
  decorators: [
    (Story) => (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Transaction History</h2>
          <p className="text-sm text-muted-foreground">
            Financial transactions with formatted currency
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Financial transaction table with formatted currency, color-coded amounts (green for credit, red for debit), and running balance. Includes number-range filters.",
      },
    },
  },
};

/**
 * Task Manager - Project task tracking.
 * Priority filtering, bulk actions, and status updates.
 */
export const TaskManager: Story = {
  render: () => {
    const [data, setData] = useState(generateTasks(80));
    const [selectedRows, setSelectedRows] = useState<Task[]>([]);

    const bulkActions: BulkAction<Task>[] = [
      {
        id: "mark-done",
        label: "Mark as Done",
        icon: <CheckCircle className="h-4 w-4" />,
        onClick: (rows) => {
          setData((prev) =>
            prev.map((task) =>
              rows.find((r) => r.id === task.id)
                ? { ...task, status: "Done" as const }
                : task,
            ),
          );
          setSelectedRows([]);
        },
      },
      {
        id: "archive",
        label: "Archive Tasks",
        icon: <Archive className="h-4 w-4" />,
        onClick: (rows) => {
          setData((prev) =>
            prev.filter((t) => !rows.find((r) => r.id === t.id)),
          );
          setSelectedRows([]);
        },
      },
    ];

    const rowActions: RowAction<Task>[] = [
      {
        id: "edit",
        label: "Edit Task",
        icon: <Edit className="h-4 w-4" />,
        onClick: (row) => {
          alert(`Edit task: ${row.title}`);
        },
      },
      {
        id: "delete",
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row) => {
          if (confirm(`Delete task: ${row.title}?`)) {
            setData((prev) => prev.filter((t) => t.id !== row.id));
          }
        },
        variant: "destructive",
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Task Manager</h2>
            <p className="text-sm text-muted-foreground">
              Track project tasks and deadlines
            </p>
          </div>
          {selectedRows.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedRows.length} task(s) selected
            </div>
          )}
        </div>
        <DataTable
          tableId="task-manager"
          data={data}
          columns={taskColumns}
          selectionMode="multiple"
          onRowSelectionChange={setSelectedRows}
          rowActions={rowActions}
          bulkActions={bulkActions}
          enableSorting
          enableFiltering
          enableGlobalFilter
          enableColumnFilters
          enablePagination
          initialPageSize={20}
          pageSizeOptions={[10, 20, 50]}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Task management system with priority badges, status tracking, and bulk operations. Shows overdue dates in red, tags as badge arrays.",
      },
    },
  },
};
