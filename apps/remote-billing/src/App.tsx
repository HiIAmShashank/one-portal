import { useState } from 'react';
import { Sidebar } from './components/Sidebar';

/**
 * Billing Remote Application
 * This is the main component exposed via Module Federation
 * 
 * Layout Structure:
 * - Left sidebar with navigation
 * - Main content area with sections
 * 
 * Requirements: FR-003 (Remote App Loading)
 */
function App() {
  const [count, setCount] = useState(0);
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="flex h-full min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Billing Application
            </h1>
            <p className="text-muted-foreground">
              Manage invoices, payments, and subscriptions
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stats Cards */}
                  <div className="p-6 border rounded-lg bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Total Revenue
                    </h3>
                    <p className="text-3xl font-bold text-foreground">$24,536</p>
                    <p className="text-sm text-green-600 mt-1">+12% from last month</p>
                  </div>
                  
                  <div className="p-6 border rounded-lg bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Pending Invoices
                    </h3>
                    <p className="text-3xl font-bold text-foreground">8</p>
                    <p className="text-sm text-yellow-600 mt-1">2 overdue</p>
                  </div>
                  
                  <div className="p-6 border rounded-lg bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Active Subscriptions
                    </h3>
                    <p className="text-3xl font-bold text-foreground">142</p>
                    <p className="text-sm text-blue-600 mt-1">5 expiring soon</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="p-6 border rounded-lg bg-card">
                  <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <div>
                        <p className="font-medium">Invoice #1234 paid</p>
                        <p className="text-sm text-muted-foreground">Acme Corp - $2,450</p>
                      </div>
                      <span className="text-sm text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <div>
                        <p className="font-medium">New subscription created</p>
                        <p className="text-sm text-muted-foreground">TechStart Inc - Pro Plan</p>
                      </div>
                      <span className="text-sm text-muted-foreground">5 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <div>
                        <p className="font-medium">Payment failed</p>
                        <p className="text-sm text-muted-foreground">Global Ltd - $890</p>
                      </div>
                      <span className="text-sm text-muted-foreground">1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoices Section */}
            {activeSection === 'invoices' && (
              <div className="p-6 border rounded-lg bg-card">
                <h2 className="text-2xl font-semibold mb-4">Invoice Management</h2>
                <p className="text-muted-foreground mb-4">
                  View and manage all your invoices in one place.
                </p>
                <div className="space-y-2">
                  <div className="p-4 bg-muted/50 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Invoice #1234</p>
                        <p className="text-sm text-muted-foreground">Acme Corp</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$2,450</p>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Paid</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Invoice #1233</p>
                        <p className="text-sm text-muted-foreground">TechStart Inc</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$1,890</p>
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payments Section */}
            {activeSection === 'payments' && (
              <div className="p-6 border rounded-lg bg-card">
                <h2 className="text-2xl font-semibold mb-4">Payment Processing</h2>
                <p className="text-muted-foreground mb-4">
                  Process and track payments from customers.
                </p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-900">💳 Payment gateway integration ready</p>
                </div>
              </div>
            )}

            {/* Subscriptions Section */}
            {activeSection === 'subscriptions' && (
              <div className="p-6 border rounded-lg bg-card">
                <h2 className="text-2xl font-semibold mb-4">Subscription Management</h2>
                <p className="text-muted-foreground mb-4">
                  Manage recurring subscriptions and billing cycles.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">Starter Plan</h3>
                    <p className="text-2xl font-bold mb-2">$29/mo</p>
                    <p className="text-sm text-muted-foreground">45 active subscriptions</p>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">Pro Plan</h3>
                    <p className="text-2xl font-bold mb-2">$99/mo</p>
                    <p className="text-sm text-muted-foreground">97 active subscriptions</p>
                  </div>
                </div>
              </div>
            )}

            {/* Demo Counter */}
            <div className="p-6 border rounded-lg bg-card">
              <h2 className="text-xl font-semibold mb-4">Interactive Demo</h2>
              <p className="text-muted-foreground mb-4">
                This counter demonstrates that the remote app maintains its own state independently.
              </p>
              <button
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                onClick={() => setCount((count) => count + 1)}
              >
                Click Count: {count}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
