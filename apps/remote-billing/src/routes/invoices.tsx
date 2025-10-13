// apps/remote-billing/src/routes/invoices.tsx
// Sample protected route for testing Billing route guards

import { createFileRoute } from '@tanstack/react-router';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';

/**
 * Invoices route - accessible at /billing/invoices
 * Protected by root route's beforeLoad guard
 */
export const Route = createFileRoute('/invoices')({
  component: Invoices,
});

function Invoices() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const account = accounts[0];

  if (!isAuthenticated || !account) {
    return (
      <div className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">
            You must be signed in to view invoices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Invoices</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
          <p className="text-gray-600 mb-4">
            This is a protected route in the Billing Remote application. 
            You can only access this page while authenticated.
          </p>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    INV-001
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2025-10-01
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    $1,250.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Paid
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    INV-002
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2025-10-08
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    $875.50
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Protected Route Test</h3>
          <p className="text-sm text-blue-800">
            Authenticated as: <strong>{account.name}</strong> ({account.username})
          </p>
          <p className="text-sm text-blue-800 mt-2">
            This route is protected by Billing's MSAL instance. Try accessing 
            <code className="bg-blue-100 px-1 rounded ml-1">/billing/invoices</code> 
            {' '}while signed out to test the redirect flow.
          </p>
        </div>
      </div>
    </div>
  );
}
