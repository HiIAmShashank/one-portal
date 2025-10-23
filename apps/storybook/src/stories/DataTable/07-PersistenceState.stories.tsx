/**
 * DataTable Persistence & State Stories
 *
 * Demonstrates state management and persistence:
 * - localStorage persistence
 * - Controlled mode (parent manages state)
 * - Uncontrolled mode (DataTable manages state)
 * - Initial state configuration
 * - State reset functionality
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DataTable } from "@one-portal/ui";
import type { Density, FilterMode } from "@one-portal/ui";
import { Button } from "@one-portal/ui";
import { RotateCcw } from "lucide-react";
import { generateUsers } from "../../mocks/data-generators";
import { userColumns } from "../../mocks/column-definitions";

// Generate mock data
const users = generateUsers(50);

const meta: Meta<typeof DataTable> = {
  title: "DataTable/07 - Persistence & State",
  component: DataTable,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "State management patterns including localStorage persistence, controlled/uncontrolled modes, and state reset.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

/**
 * With Persistence - Automatic localStorage persistence.
 * Column preferences are automatically saved and restored.
 */
export const WithPersistence: Story = {
  args: {
    tableId: "persistence-demo",
    data: users,
    columns: userColumns,
    enableSorting: true,
    enableFiltering: true,
    enableColumnVisibility: true,
    enableColumnResizing: true,
    enableColumnReordering: true,
    enableColumnPinning: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  decorators: [
    (Story) => (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold mb-2">📦 Persistence Enabled</h3>
          <p className="text-sm text-muted-foreground">
            Try resizing, reordering, hiding columns, or changing density. Your
            preferences are automatically saved to localStorage and will persist
            across page refreshes.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Persisted state:</strong> Column widths, order, visibility,
            pinning, density, and filter mode.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "DataTable automatically persists column preferences to localStorage when tableId is provided. Reload the page to see your changes restored.",
      },
    },
  },
};

/**
 * Controlled Mode - Parent component controls state.
 * Density and filter mode are controlled by parent.
 */
export const ControlledMode: Story = {
  render: () => {
    const [density, setDensity] = useState<Density>("default");
    const [filterMode, setFilterMode] = useState<FilterMode>("inline");

    return (
      <div className="space-y-4">
        <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="text-sm font-semibold mb-3">🎮 Controlled Mode</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Parent component manages density and filter mode state. External
            controls can modify table appearance.
          </p>

          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Density</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={density === "compact" ? "default" : "outline"}
                  onClick={() => setDensity("compact")}
                >
                  Compact
                </Button>
                <Button
                  size="sm"
                  variant={density === "default" ? "default" : "outline"}
                  onClick={() => setDensity("default")}
                >
                  Default
                </Button>
                <Button
                  size="sm"
                  variant={density === "relaxed" ? "default" : "outline"}
                  onClick={() => setDensity("relaxed")}
                >
                  Relaxed
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Filter Mode
              </label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filterMode === "toolbar" ? "default" : "outline"}
                  onClick={() => setFilterMode("toolbar")}
                >
                  Toolbar
                </Button>
                <Button
                  size="sm"
                  variant={filterMode === "inline" ? "default" : "outline"}
                  onClick={() => setFilterMode("inline")}
                >
                  Inline
                </Button>
                <Button
                  size="sm"
                  variant={filterMode === "hidden" ? "default" : "outline"}
                  onClick={() => setFilterMode("hidden")}
                >
                  Hidden
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DataTable
          tableId="controlled-mode"
          data={users}
          columns={userColumns}
          density={density}
          onDensityChange={setDensity}
          filterMode={filterMode}
          onFilterModeChange={setFilterMode}
          enableSorting
          enableFiltering
          enablePagination
          initialPageSize={10}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Controlled mode allows parent components to manage DataTable state. External UI controls can modify table appearance programmatically.",
      },
    },
  },
};

/**
 * Uncontrolled Mode - DataTable manages its own state.
 * All state is managed internally with no external control.
 */
export const UncontrolledMode: Story = {
  args: {
    tableId: "uncontrolled-mode",
    data: users,
    columns: userColumns,
    enableSorting: true,
    enableFiltering: true,
    enableColumnVisibility: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  decorators: [
    (Story) => (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-sm font-semibold mb-2">🔓 Uncontrolled Mode</h3>
          <p className="text-sm text-muted-foreground">
            DataTable manages all state internally. No external state management
            required. This is the default and recommended mode for most use
            cases.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Benefits:</strong> Simpler implementation, automatic
            persistence, less boilerplate code.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Uncontrolled mode (default) lets DataTable manage its own state internally. Simplest implementation with automatic persistence. Recommended for most use cases.",
      },
    },
  },
};

/**
 * Initial State - Pre-configured table state.
 * Table starts with specific columns hidden, sorted, and sized.
 */
export const InitialState: Story = {
  args: {
    tableId: "initial-state",
    data: users,
    columns: userColumns,
    // Initial column visibility
    initialColumnVisibility: {
      department: false,
      createdAt: false,
    },
    // Initial sorting
    initialSortingState: [{ id: "name", desc: false }],
    // Initial column sizing
    initialColumnSizing: {
      name: 250,
      email: 300,
    },
    // Initial column order
    initialColumnOrder: [
      "avatar",
      "name",
      "email",
      "role",
      "status",
      "lastLogin",
      "department",
      "createdAt",
    ],
    enableSorting: true,
    enableFiltering: true,
    enableColumnVisibility: true,
    enableColumnResizing: true,
    enablePagination: true,
    initialPageSize: 15,
  },
  decorators: [
    (Story) => (
      <div className="space-y-4">
        <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
          <h3 className="text-sm font-semibold mb-2">⚙️ Initial State</h3>
          <p className="text-sm text-muted-foreground">
            Table starts with pre-configured state:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li>Department and Created columns hidden</li>
            <li>Sorted by Name (ascending)</li>
            <li>Name column: 250px, Email: 300px</li>
            <li>15 rows per page</li>
          </ul>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Configure initial table state with initialColumnVisibility, initialSortingState, initialColumnSizing, and more. Useful for setting default views.",
      },
    },
  },
};

/**
 * State Reset - Reset table to default state.
 * Button to clear all localStorage and reset preferences.
 */
export const StateReset: Story = {
  render: () => {
    const [key, setKey] = useState(0);
    const tableId = "state-reset-demo";

    const handleReset = () => {
      // Clear localStorage for this table
      const keysToRemove = [
        `oneportal:datatable:${tableId}:state`,
        `table-${tableId}-density`,
        `table-${tableId}-filterMode`,
        `table-${tableId}-grouping`,
        `table-${tableId}-expanded`,
      ];

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Force re-render with new key
      setKey((prev) => prev + 1);

      alert("Table state has been reset to defaults!");
    };

    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-semibold mb-2">🔄 State Reset</h3>
              <p className="text-sm text-muted-foreground">
                Customize the table (resize, reorder, hide columns), then click
                Reset to clear all preferences and return to default state.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Reset clears:</strong> Column widths, order, visibility,
                pinning, density, and filter mode.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReset}
              className="flex gap-2 items-center"
            >
              <RotateCcw className="h-4 w-4" />
              Reset State
            </Button>
          </div>
        </div>

        <DataTable
          key={key}
          tableId={tableId}
          data={users}
          columns={userColumns}
          enableSorting
          enableFiltering
          enableColumnVisibility
          enableColumnResizing
          enableColumnReordering
          enablePagination
          initialPageSize={10}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrate state reset functionality. Modify table preferences, then click Reset to clear localStorage and restore defaults. Uses React key to force remount.",
      },
    },
  },
};

/**
 * Disable Persistence - Turn off localStorage.
 * Table state is not persisted between sessions.
 */
export const DisablePersistence: Story = {
  args: {
    tableId: "no-persistence",
    data: users,
    columns: userColumns,
    enablePersistence: false, // Disable persistence
    enableSorting: true,
    enableFiltering: true,
    enableColumnVisibility: true,
    enableColumnResizing: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  decorators: [
    (Story) => (
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold mb-2">
            🚫 Persistence Disabled
          </h3>
          <p className="text-sm text-muted-foreground">
            Set enablePersistence={"{false}"} to disable localStorage. Changes
            will not be saved between sessions. Useful for temporary views or
            embedded tables.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Disable localStorage persistence with enablePersistence={false}. Table state resets on page refresh. Useful for temporary views.",
      },
    },
  },
};
