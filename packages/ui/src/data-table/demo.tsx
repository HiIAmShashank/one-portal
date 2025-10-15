/**
 * DataTable Demo - Example usage of the DataTable component
 * This file demonstrates how to use the DataTable with sample data
 */

import { DataTable, type ColumnDef } from '@one-portal/ui';

// Sample data type
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

// Sample data
const sampleUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'active',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'User',
    status: 'inactive',
    createdAt: new Date('2024-03-10'),
  },
];

// Column definitions
const columns: ColumnDef<User>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: 'ID',
    size: 80,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    size: 200,
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    size: 250,
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: 'Role',
    size: 120,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <span
          className={
            status === 'active'
              ? 'text-green-600 font-medium'
              : 'text-gray-400'
          }
        >
          {status}
        </span>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Created At',
    size: 150,
    cell: ({ getValue }) => {
      const date = getValue() as Date;
      return date.toLocaleDateString();
    },
  },
];

// Demo component
export function DataTableDemo() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">DataTable Demo</h1>
      
      <DataTable
        tableId="users-demo"
        data={sampleUsers}
        columns={columns}
        enableSorting
        enableFiltering
        enablePagination
        pageSize={10}
      />
    </div>
  );
}
