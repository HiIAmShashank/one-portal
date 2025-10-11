import { createFileRoute } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
} from '@one-portal/ui';

/**
 * Index route - Shell home/dashboard
 * Path: /
 */
export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Welcome to <span className="text-primary">OnePortal</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your unified hub for all enterprise applications. 
            Access billing, reports, and more—all in one place.
          </p>
        </div>

        <Separator className="my-8" />

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Billing Management</CardTitle>
                <Badge variant="default">Available</Badge>
              </div>
              <CardDescription>
                Manage customer invoices, payments, and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Invoice generation and tracking</li>
                <li>• Payment processing</li>
                <li>• Subscription management</li>
                <li>• Financial reporting</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reports & Analytics</CardTitle>
                <Badge variant="default">Available</Badge>
              </div>
              <CardDescription>
                Access comprehensive reports and data analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Sales performance reports</li>
                <li>• Analytics dashboard</li>
                <li>• Custom report builder</li>
                <li>• Export to PDF/Excel</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Step 1:</strong> Select an application from the navigation menu above
            </p>
            <p>
              <strong>Step 2:</strong> The application will load dynamically in this space
            </p>
            <p>
              <strong>Step 3:</strong> Use the browser back/forward buttons to navigate between apps
            </p>
          </CardContent>
        </Card>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
