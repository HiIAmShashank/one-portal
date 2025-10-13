// apps/shell/src/routes/dashboard.tsx
// Sample protected route for testing route guards

import { createFileRoute } from '@tanstack/react-router';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const account = accounts[0];

  if (!isAuthenticated || !account) {
    return (
      <div className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">
            You must be signed in to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {account.name}!</h2>
          <p className="text-gray-600 mb-4">
            This is a protected route in the Shell application. You can only access this
            page while authenticated.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2">User Info</h3>
              <p className="text-sm text-gray-600">Name: {account.name}</p>
              <p className="text-sm text-gray-600">Email: {account.username}</p>
              <p className="text-sm text-gray-600">ID: {account.localAccountId}</p>
            </div>
            
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2">Auth Status</h3>
              <p className="text-sm text-gray-600">
                Status: <span className="text-green-600 font-semibold">Authenticated</span>
              </p>
              <p className="text-sm text-gray-600">
                Client ID: {account.homeAccountId.split('.')[1]}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Protected Route Test</h3>
          <p className="text-sm text-blue-800">
            Try signing out and navigating directly to <code className="bg-blue-100 px-1 rounded">/dashboard</code>.
            You should be redirected to sign in with a returnUrl parameter.
          </p>
        </div>
      </div>
    </div>
  );
}
