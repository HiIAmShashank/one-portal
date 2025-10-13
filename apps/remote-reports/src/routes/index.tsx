// apps/remote-reports/src/routes/index.tsx
// Reports home route - dashboard overview

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';

/**
 * Reports home route
 * Path: /apps/reports (basepath) + / = /apps/reports
 */
export const Route = createFileRoute('/')({
  component: ReportsHome,
});

function ReportsHome() {
  const [count, setCount] = useState(0);
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="flex h-full bg-background">
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

                {/* Demo Counter */}
                <div className="p-6 border rounded-lg bg-card">
                  <h2 className="text-xl font-semibold mb-4">Interactive Demo</h2>
                  <p className="text-muted-foreground mb-4">
                    This counter demonstrates that the Reports app maintains its own state independently.
                  </p>
                  <button
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    onClick={() => setCount((count) => count + 1)}
                  >
                    Click Count: {count}
                  </button>
                </div>
              </div>
            )}

            {/* Custom Reports Section Stub */}
            {activeSection !== 'dashboard' && (
              <div className="p-6 border rounded-lg bg-card">
                <h2 className="text-2xl font-semibold mb-4">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Section
                </h2>
                <p className="text-muted-foreground">
                  Content for {activeSection} would go here.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
