/**
 * Sidebar Component for Billing App
 * 
 * Provides left-side navigation for different billing sections
 * Requirements: UX-001 (Consistent Navigation)
 */

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const sections = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'invoices', label: 'Invoices', icon: '📄' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '🔄' },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground px-3">
          Billing
        </h2>
        <p className="text-sm text-muted-foreground px-3">
          Navigation
        </p>
      </div>

      <nav className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`
              w-full text-left px-3 py-2 rounded-md transition-colors
              flex items-center gap-3
              ${
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-foreground hover:bg-muted'
              }
            `}
          >
            <span className="text-xl">{section.icon}</span>
            <span>{section.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-8 px-3">
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Remote Module
          </p>
          <p className="text-sm font-mono text-foreground">
            @billing/app
          </p>
        </div>
      </div>
    </aside>
  );
}
