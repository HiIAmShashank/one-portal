import { useState } from 'react';
import { Sidebar } from './components/Sidebar';

/**
 * Reports Remote Application
 * This is the main component exposed via Module Federation
 * 
 * Layout Structure:
 * - Left sidebar with navigation
 * - Main content area with reports
 * 
 * Requirements: FR-003 (Remote App Loading)
 */
function App() {
  const [count, setCount] = useState(0);
  const [activeSection, setActiveSection] = useState('dashboard');

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
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights and data visualization
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* KPI Cards */}
                  <div className="p-6 border rounded-lg bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Total Sales
                    </h3>
                    <p className="text-3xl font-bold text-foreground">$145.2K</p>
                    <p className="text-sm text-green-600 mt-1">+18% vs last month</p>
                  </div>
                  
                  <div className="p-6 border rounded-lg bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      New Customers
                    </h3>
                    <p className="text-3xl font-bold text-foreground">286</p>
                    <p className="text-sm text-green-600 mt-1">+24% vs last month</p>
                  </div>
                  
                  <div className="p-6 border rounded-lg bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Avg. Order Value
                    </h3>
                    <p className="text-3xl font-bold text-foreground">$508</p>
                    <p className="text-sm text-red-600 mt-1">-3% vs last month</p>
                  </div>
                  
                  <div className="p-6 border rounded-lg bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Conversion Rate
                    </h3>
                    <p className="text-3xl font-bold text-foreground">3.2%</p>
                    <p className="text-sm text-green-600 mt-1">+0.4% vs last month</p>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="p-8 border rounded-lg bg-card">
                  <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
                  <div className="h-64 flex items-center justify-center bg-muted rounded">
                    <p className="text-muted-foreground">📈 Chart visualization would go here</p>
                  </div>
                </div>

                {/* Recent Reports */}
                <div className="p-6 border rounded-lg bg-card">
                  <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
                  <div className="space-y-2">
                    <div className="p-4 bg-muted/50 rounded flex items-center justify-between">
                      <div>
                        <p className="font-medium">Q4 2024 Sales Summary</p>
                        <p className="text-sm text-muted-foreground">Generated on Jan 5, 2025</p>
                      </div>
                      <button className="text-sm text-primary hover:underline">
                        Download
                      </button>
                    </div>
                    <div className="p-4 bg-muted/50 rounded flex items-center justify-between">
                      <div>
                        <p className="font-medium">Customer Analytics Report</p>
                        <p className="text-sm text-muted-foreground">Generated on Jan 3, 2025</p>
                      </div>
                      <button className="text-sm text-primary hover:underline">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sales Section */}
            {activeSection === 'sales' && (
              <div className="p-6 border rounded-lg bg-card">
                <h2 className="text-2xl font-semibold mb-4">Sales Reports</h2>
                <p className="text-muted-foreground mb-4">
                  Detailed sales performance and revenue analytics.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">By Product</h3>
                    <div className="h-48 flex items-center justify-center bg-muted rounded">
                      <p className="text-muted-foreground">Product breakdown chart</p>
                    </div>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">By Region</h3>
                    <div className="h-48 flex items-center justify-center bg-muted rounded">
                      <p className="text-muted-foreground">Regional breakdown chart</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {activeSection === 'analytics' && (
              <div className="p-6 border rounded-lg bg-card">
                <h2 className="text-2xl font-semibold mb-4">Advanced Analytics</h2>
                <p className="text-muted-foreground mb-4">
                  Deep dive into customer behavior and trends.
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-blue-900">📊 Customer cohort analysis</p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                    <p className="text-purple-900">🎯 Funnel visualization</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-900">💡 Predictive insights</p>
                  </div>
                </div>
              </div>
            )}

            {/* Export Section */}
            {activeSection === 'export' && (
              <div className="p-6 border rounded-lg bg-card">
                <h2 className="text-2xl font-semibold mb-4">Export Reports</h2>
                <p className="text-muted-foreground mb-4">
                  Download reports in various formats.
                </p>
                <div className="space-y-3">
                  <button className="w-full p-4 border rounded-lg hover:bg-muted transition-colors text-left">
                    <p className="font-medium">📄 Export to PDF</p>
                    <p className="text-sm text-muted-foreground">Formatted reports ready to print</p>
                  </button>
                  <button className="w-full p-4 border rounded-lg hover:bg-muted transition-colors text-left">
                    <p className="font-medium">📊 Export to Excel</p>
                    <p className="text-sm text-muted-foreground">Raw data for further analysis</p>
                  </button>
                  <button className="w-full p-4 border rounded-lg hover:bg-muted transition-colors text-left">
                    <p className="font-medium">📈 Export to CSV</p>
                    <p className="text-sm text-muted-foreground">Compatible with all spreadsheet tools</p>
                  </button>
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
