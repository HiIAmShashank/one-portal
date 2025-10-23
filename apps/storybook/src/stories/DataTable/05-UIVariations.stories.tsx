/**
 * DataTable UI Variations Stories
 *
 * Demonstrates visual and layout variations:
 * - Density settings (compact, default, relaxed)
 * - Filter modes (toolbar, inline, hidden)
 * - Table variants (default, bordered, striped)
 * - Theme modes (light, dark)
 */

import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "@one-portal/ui";
import { generateUsers } from "../../mocks/data-generators";
import { userColumns } from "../../mocks/column-definitions";

// Generate mock data
const users = generateUsers(50);

const meta: Meta<typeof DataTable> = {
  title: "DataTable/05 - UI Variations",
  component: DataTable,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Visual and layout variations including density, filter modes, table variants, and theming.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

/**
 * Compact Density - Tight spacing for maximum data visibility.
 * Smaller padding and text size.
 */
export const CompactDensity: Story = {
  args: {
    tableId: "ui-compact",
    data: users,
    columns: userColumns,
    density: "compact",
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    initialPageSize: 15,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Compact density uses tight spacing and smaller text. Ideal for displaying maximum data in limited space. Set density="compact" prop.',
      },
    },
  },
};

/**
 * Default Density - Standard spacing for balanced readability.
 * Medium padding and text size.
 */
export const DefaultDensity: Story = {
  args: {
    tableId: "ui-default",
    data: users,
    columns: userColumns,
    density: "default",
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default density provides balanced spacing for comfortable reading. This is the default setting. Set density="default" prop.',
      },
    },
  },
};

/**
 * Relaxed Density - Loose spacing for comfortable reading.
 * Larger padding and text size.
 */
export const RelaxedDensity: Story = {
  args: {
    tableId: "ui-relaxed",
    data: users,
    columns: userColumns,
    density: "relaxed",
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    initialPageSize: 8,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Relaxed density uses generous spacing for maximum comfort. Best for presentations or accessibility needs. Set density="relaxed" prop.',
      },
    },
  },
};

/**
 * Filter Mode: Toolbar - Filters in toolbar above table.
 * Column filters appear in a toolbar section.
 */
export const FilterModeToolbar: Story = {
  args: {
    tableId: "ui-filter-toolbar",
    data: users,
    columns: userColumns,
    filterMode: "toolbar",
    enableFiltering: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableSorting: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Toolbar filter mode places all filters in the toolbar above the table. Keeps the table clean. Set filterMode="toolbar" prop.',
      },
    },
  },
};

/**
 * Filter Mode: Inline - Filters below column headers.
 * Column filters appear directly below headers.
 */
export const FilterModeInline: Story = {
  args: {
    tableId: "ui-filter-inline",
    data: users,
    columns: userColumns,
    filterMode: "inline",
    enableFiltering: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableSorting: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Inline filter mode shows filters directly below column headers. Provides immediate visual feedback. Set filterMode="inline" prop.',
      },
    },
  },
};

/**
 * Filter Mode: Hidden - No filters displayed.
 * Filters are programmatically controlled only.
 */
export const FilterModeHidden: Story = {
  args: {
    tableId: "ui-filter-hidden",
    data: users,
    columns: userColumns,
    filterMode: "hidden",
    enableFiltering: true,
    enableSorting: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Hidden filter mode hides all filter UI. Useful when filters are controlled programmatically. Set filterMode="hidden" prop.',
      },
    },
  },
};

/**
 * Variant: Default - Clean modern style.
 * Standard table appearance without borders.
 */
export const VariantDefault: Story = {
  args: {
    tableId: "ui-variant-default",
    data: users,
    columns: userColumns,
    variant: "default",
    enableSorting: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default variant provides a clean, modern look without heavy borders. This is the default style. Set variant="default" prop.',
      },
    },
  },
};

/**
 * Variant: Bordered - Bordered cells.
 * All cells have visible borders.
 */
export const VariantBordered: Story = {
  args: {
    tableId: "ui-variant-bordered",
    data: users,
    columns: userColumns,
    variant: "bordered",
    enableSorting: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Bordered variant adds borders to all cells. Creates clear visual separation between cells. Set variant="bordered" prop.',
      },
    },
  },
};

/**
 * Variant: Striped - Alternating row colors.
 * Every other row has a background color.
 */
export const VariantStriped: Story = {
  args: {
    tableId: "ui-variant-striped",
    data: users,
    columns: userColumns,
    variant: "striped",
    enableSorting: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Striped variant alternates row background colors. Improves row scanning and readability. Set variant="striped" prop.',
      },
    },
  },
};

/**
 * Light Mode - Light theme styling.
 * Table styled for light backgrounds.
 */
export const LightMode: Story = {
  args: {
    tableId: "ui-light-mode",
    data: users,
    columns: userColumns,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story:
          "Light mode theme with light background colors. Default theme for most applications. Uses CSS variables that adapt to theme.",
      },
    },
  },
};

/**
 * Dark Mode - Dark theme styling.
 * Table styled for dark backgrounds.
 */
export const DarkMode: Story = {
  args: {
    tableId: "ui-dark-mode",
    data: users,
    columns: userColumns,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    initialPageSize: 10,
  },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          'Dark mode theme with dark background colors. Automatically adapts when "dark" class is on document root. Uses CSS variables.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};

/**
 * Combined UI Customization - All UI features together.
 * Demonstrates combining density, filters, variant, and features.
 */
export const CombinedUICustomization: Story = {
  args: {
    tableId: "ui-combined",
    data: users,
    columns: userColumns,
    density: "compact",
    filterMode: "inline",
    variant: "bordered",
    enableSorting: true,
    enableFiltering: true,
    enableGlobalFilter: true,
    enableColumnVisibility: true,
    enablePagination: true,
    initialPageSize: 15,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Combines all UI variations: compact density, inline filters, bordered variant. Shows how different settings work together.",
      },
    },
  },
};
