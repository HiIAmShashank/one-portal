// apps/remote-reports/src/routes/analytics.tsx
// Sample protected route for testing Reports route guards

import { createFileRoute } from '@tanstack/react-router';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { DataTable}from '@one-portal/ui';
import { useQuery } from '@tanstack/react-query';
import { User, userColumns } from '../columns/userColumns';
import { useEffect } from 'react';

/**
 * Analytics route - accessible at /reports/analytics
 * Protected by root route's beforeLoad guard
 */
export const Route = createFileRoute('/analytics')({
  component: Analytics,
});


const fetchData = async (): Promise<User[]> => {
  let response = await fetch('http://localhost:3000/users');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}


function Analytics() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const account = accounts[0];

  const info = useQuery({ queryKey: ['users'], queryFn: fetchData })
  useEffect(() => {
    console.log('Data fetched:', info.data);
  }, [info.data]);

  // Define bulk actions for testing Phase 6
  // const bulkUserActions: BulkAction<User>[] = [
  //   {
  //     id: 'delete-users',
  //     label: 'Delete Selected',
  //     icon: <Trash className="h-4 w-4" />,
  //     variant: 'destructive',
  //     onClick: async (users) => {
  //       if (confirm(`Delete ${users.length} user${users.length > 1 ? 's' : ''}?`)) {
  //         console.log('Deleting users:', users.map(u => u.id));
  //         alert(`Deleted ${users.length} user${users.length > 1 ? 's' : ''} (simulated)`);
  //       }
  //     },
  //     minSelection: 1,
  //     tooltip: 'Delete all selected users',
  //   },
  //   {
  //     id: 'export-users',
  //     label: 'Export to CSV',
  //     icon: <Download className="h-4 w-4" />,
  //     onClick: (users) => {
  //       // Simple CSV export simulation
  //       const csv = 'ID,Username,Name,Role\n' + users.map(u => 
  //         `${u.id},${u.username},"${u.firstName} ${u.lastName}",${u.role}`
  //       ).join('\n');
  //       console.log('CSV Data:', csv);
  //       alert(`Exported ${users.length} user${users.length > 1 ? 's' : ''} to CSV (check console)`);
  //     },
  //     minSelection: 1,
  //     maxSelection: 100,
  //     tooltip: 'Export selected users to CSV',
  //   },
  // ];

  // Define row actions for testing Phase 8


  if (!isAuthenticated || !account) {
    return (
      <div className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">
            You must be signed in to view analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DataTable
        tableId="sorted-table"
        data={info.data || []}
        columns={userColumns}
        enableColumnFilters={true}
        enableRowSelection={true}
        selectionMode="multiple"
        enableInlineEditing={true}
      />
    </>
  );
}
