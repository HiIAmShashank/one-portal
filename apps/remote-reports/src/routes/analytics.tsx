// apps/remote-reports/src/routes/analytics.tsx
// Sample protected route for testing Reports route guards

import { createFileRoute } from '@tanstack/react-router';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';

/**
 * Analytics route - accessible at /reports/analytics
 * Protected by root route's beforeLoad guard
 */
export const Route = createFileRoute('/analytics')({
  component: Analytics,
});

function Analytics() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const account = accounts[0];

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
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
          <p className="text-gray-600 mb-6">
            This is a protected route in the Reports Remote application. 
            You can only access this page while authenticated.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-semibold mb-1">Total Users</div>
              <div className="text-3xl font-bold text-blue-900">1,234</div>
              <div className="text-xs text-blue-600 mt-1">↑ 12% from last month</div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-600 font-semibold mb-1">Active Sessions</div>
              <div className="text-3xl font-bold text-green-900">567</div>
              <div className="text-xs text-green-600 mt-1">↑ 8% from last week</div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-semibold mb-1">Conversion Rate</div>
              <div className="text-3xl font-bold text-purple-900">23.4%</div>
              <div className="text-xs text-purple-600 mt-1">↓ 2% from last month</div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Page Views</span>
                <span className="text-sm font-semibold">45,678</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Unique Visitors</span>
                <span className="text-sm font-semibold">12,345</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Bounce Rate</span>
                <span className="text-sm font-semibold">42.3%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm">Avg. Session Duration</span>
                <span className="text-sm font-semibold">4m 32s</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Protected Route Test</h3>
          <p className="text-sm text-blue-800">
            Authenticated as: <strong>{account.name}</strong> ({account.username})
          </p>
          <p className="text-sm text-blue-800 mt-2">
            This route is protected by Reports' MSAL instance. Try accessing 
            <code className="bg-blue-100 px-1 rounded ml-1">/reports/analytics</code> 
            {' '}while signed out to test the redirect flow.
          </p>
        </div>
      </div>
    </div>
  );
}
