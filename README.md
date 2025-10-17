# OnePortal

A micro-frontend portal built with Module Federation, Turborepo, and Tailwind CSS v4.

## Tech Stack

### Core Framework
- **[Turborepo](https://turbo.build/repo)** - High-performance monorepo build system
- **[Vite](https://vitejs.dev)** - Lightning-fast build tool and dev server
- **[React 19](https://react.dev)** - UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

### Micro-Frontend Architecture
- **[@originjs/vite-plugin-federation](https://github.com/originjs/vite-plugin-federation)** - Module Federation for Vite
- **Shell Application** - Host application that loads remote modules
- **Remote Applications** - Independently deployable micro-frontends

### Styling
- **[Tailwind CSS v4](https://tailwindcss.com)** - Utility-first CSS framework (latest version)
- **[shadcn/ui](https://ui.shadcn.com)** - Re-usable component library built with Radix UI
- **CSS Variables** - Design tokens for theming (light/dark mode)

### Routing & Navigation
- **[@tanstack/react-router](https://tanstack.com/router)** - Type-safe routing with code splitting
- **File-based routing** - Convention-based route structure

### Deployment
- **[Azure Static Web Apps](https://azure.microsoft.com/en-us/services/app-service/static/)** - Serverless hosting and deployment
- **SWA CLI** - Local development emulator for Azure SWA

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **Turborepo Generators** - Code generation for new remote apps

## Project Structure

```
one-portal/
├── apps/
│   ├── shell/                 # Host application (Module Federation shell)
│   └── remote-*/              # Remote micro-frontend applications
├── packages/
│   ├── ui/                    # Shared UI component library (shadcn/ui)
│   ├── types/                 # Shared TypeScript types
│   └── eslint-config/         # Shared ESLint configuration
├── scripts/
│   └── combine-builds.js      # Combines remote builds for deployment
└── turbo/
    └── generators/            # Turborepo code generators
```

## Package.json Scripts

### Root-level Scripts

```json
{
  "dev": "turbo run dev",                    // Start all apps in dev mode
  "build": "turbo run build",                // Build all apps and packages
  "lint": "turbo run lint",                  // Lint all packages
  "typecheck": "turbo run typecheck",        // Type-check all packages
  "format": "prettier --write \"**/*.{ts,tsx,md}\"",  // Format code
  "swa:start": "swa start ./swa --api-location ./api",  // Start Azure SWA emulator
  "deploy": "pnpm build && swa deploy"       // Build and deploy to Azure
}
```

### Common Package Scripts

Each app/package includes:
- `dev` - Start development server
- `build` - Build for production
- `lint` - Run ESLint
- `typecheck` - Run TypeScript compiler checks

### Turborepo Tasks

Turborepo manages build pipelines with intelligent caching:
- **Incremental builds** - Only rebuilds changed packages
- **Remote caching** - Share build cache across team (optional)
- **Parallel execution** - Runs tasks concurrently when possible

## Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **pnpm** v9 or higher

```bash
npm install -g pnpm
```

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd one-portal

# Install dependencies
pnpm install
```

### Development

```bash
# Start all apps in development mode
pnpm dev

# Start specific app
pnpm dev --filter=@one-portal/shell

# Build all apps
pnpm build

# Start Azure SWA emulator (after build)
pnpm swa:start
```

The shell app runs at `http://localhost:5173` in dev mode, or `http://localhost:4280` with SWA emulator.

## Creating New Remote Apps

Use the Turborepo generator to scaffold new remote applications:

```bash
# Run the generator
pnpm turbo gen remote-app

# Follow the prompts:
# - App Name: billing (lowercase, no spaces)
# - Display Name: Billing
# - Description: Billing and invoicing management
# - Display Order: 3
```

### What the Generator Creates

```
apps/remote-{appName}/
├── src/
│   ├── App.tsx              # Main component
│   ├── bootstrap.tsx        # Module Federation mount/unmount
│   ├── main.tsx             # Standalone entry point
│   └── vite-env.d.ts        # Vite types
├── index.html               # HTML template
├── package.json             # Dependencies (includes @one-portal/ui)
├── vite.config.ts           # Module Federation configuration
├── tsconfig.json            # TypeScript config
└── eslint.config.js         # ESLint config
```

### Generator Also Updates

1. **`scripts/combine-builds.js`** - Adds new remote to deployment script
2. **Shell navigation** - Adds route to navigation menu

### Important: Remote Apps Don't Need CSS

Remote apps use components from `@one-portal/ui` and automatically get all styles from the shell. **Do not add**:
- ❌ `tailwind.config.ts`
- ❌ CSS files
- ❌ CSS imports
- ❌ Tailwind dependencies

## Using shadcn/ui Components

### Architecture

- **UI Package** (`packages/ui/`) compiles all Tailwind CSS and shadcn components
- **Shell** imports the compiled CSS once
- **Remote apps** import React components from `@one-portal/ui`

### Adding New shadcn Components

```bash
# Navigate to UI package
cd packages/ui

# Add a component using shadcn CLI
pnpm dlx shadcn@latest add button

# Or add multiple components
pnpm dlx shadcn@latest add button card dialog
```

### Available Components

The UI package includes common shadcn components:
- Button
- Card
- Input
- Label
- Tabs
- Dialog
- Dropdown Menu
- And more...

See [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for full list.

### Importing Components in Remote Apps

```tsx
// In any remote app (e.g., apps/remote-billing/src/App.tsx)
import { Button } from '@one-portal/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@one-portal/ui/card';

export default function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Create Invoice</Button>
      </CardContent>
    </Card>
  );
}
```

### Using Tailwind Classes

All Tailwind utility classes and shadcn design tokens are available:

```tsx
<div className="bg-card text-card-foreground border rounded-lg shadow p-6">
  <h1 className="text-2xl font-bold">Dashboard</h1>
  <p className="text-muted-foreground">Welcome back!</p>
</div>
```

### Dark Mode

Dark mode is automatically handled via CSS variables:

```tsx
// Toggle dark mode (in shell)
document.documentElement.classList.toggle('dark');
```

All shadcn components and Tailwind utilities automatically adapt to dark mode.

## Architecture

### Centralized Styling System

OnePortal uses a **centralized CSS architecture** with Tailwind CSS v4 to ensure consistency and eliminate duplication:

```
packages/tailwind-config/     # Single source of truth for design tokens
├── src/tokens.ts             # Colors, spacing, typography, shadows
└── src/index.ts              # Base Tailwind configuration

packages/ui/                  # Compiles CSS and exports components
├── dist/styles.css           # Compiled Tailwind CSS (exported)
├── tailwind.config.js        # Extends @one-portal/tailwind-config
└── src/                      # React components + theme

apps/shell/                   # Imports compiled CSS
└── src/main.tsx              # import '@one-portal/ui/styles.css'

apps/remote-*/                # Inherit styles from shell
└── src/main.tsx              # Conditional CSS import for dev mode
```

**Key Benefits:**
- ✅ Design tokens defined once, used everywhere
- ✅ Apps don't need individual Tailwind configs
- ✅ Style changes update all apps instantly
- ✅ Faster builds (CSS compiled once)
- ✅ Smaller bundle sizes (no CSS duplication)

### How It Works

1. **Design Tokens** (`packages/tailwind-config`)
   - Central repository for colors, spacing, typography, shadows
   - Exported as TypeScript for type safety
   - Consumed by all apps and packages

2. **UI Package Compilation**
   ```bash
   # packages/ui/package.json
   "build": "tailwindcss -i ./src/index.css -o ./dist/styles.css"
   ```

3. **Theme Configuration** (`packages/ui/src/theme.css`)
   - Uses `@theme` directive (Tailwind v4 feature)
   - Defines CSS variables for light/dark modes
   - Integrates with centralized design tokens

4. **Shell Imports Compiled CSS** (`apps/shell/src/main.tsx`)
   ```tsx
   import '@one-portal/ui/styles.css';  // Unconditional
   ```

5. **Remote Apps Conditional Import** (`apps/remote-*/src/main.tsx`)
   ```tsx
   // CSS provided by shell in production
   // Import conditionally for standalone dev/preview
   if (import.meta.env.DEV || import.meta.env.MODE === 'preview') {
     await import('@one-portal/ui/styles.css');
   }
   ```

### Running Apps Standalone

Each app can run independently for isolated development:

```bash
# Shell app
pnpm --filter shell dev

# Any remote app
pnpm --filter remote-billing dev
pnpm --filter remote-reports dev
pnpm --filter remote-testgenerator1 dev
```

**How standalone mode works:**
- Apps conditionally import `@one-portal/ui/styles.css` in dev mode
- All Tailwind classes and components work correctly
- No dependency on other apps being built first
- Full HMR support for rapid development

### Hot Module Replacement (HMR)

Changes to shared components reflect instantly across all running apps:

**Component Changes:**
1. Edit any file in `packages/ui/src/` or `packages/ui/components/`
2. HMR updates all consuming apps within ~2 seconds
3. Component state preserved (form inputs, scroll position)

**CSS/Token Changes:**
1. Edit `packages/ui/src/theme.css` or `packages/tailwind-config/src/tokens.ts`
2. Rebuild CSS: `pnpm --filter @one-portal/ui build`
3. Refresh apps to see style changes

**HMR Logging:**
All apps include HMR event logging for debugging:
```
[Shell HMR] File changed: packages/ui/src/components/button.tsx
[Billing HMR] File changed: packages/ui/src/components/button.tsx
```

### Code Quality - Dead Code Detection

This repository uses [Knip](https://knip.dev) to automatically detect unused code:

```bash
# Run dead code analysis
pnpm deadcode
```

**What Knip Checks:**
- Unused files
- Unused dependencies
- Unused devDependencies
- Unused exports
- Unused types

**CI Integration:**
Dead code checks run automatically in CI pipeline after linting and type checking. The build fails if new unused code is introduced.

**Analyzed Workspaces:**
- `apps/*` - All applications (shell + remotes)
- `packages/ui` - Shared component library
- `packages/auth` - Authentication utilities
- `packages/types` - Shared TypeScript types
- `packages/tailwind-config` - Design system tokens

### Key Differences from Tailwind v3

| Tailwind v3 | Tailwind v4 |
|-------------|-------------|
| PostCSS plugin | CLI-based compilation |
| `tailwind.config.js` has theme | `@theme` directive in CSS |
| Each app compiles CSS | UI package compiles once |
| JIT mode | Built-in optimization |
| Inline theme values | Centralized design tokens |

## Build and Deployment

### Local Build

```bash
# Build all packages
pnpm build

# Combine remote builds for deployment
node scripts/combine-builds.js

# Test with Azure SWA emulator
pnpm swa:start
```

### What `combine-builds.js` Does

1. Copies shell build to `swa/` directory
2. Copies each remote app build to `swa/{appName}/`
3. Preserves Module Federation structure
4. Prepares static files for Azure deployment

### Deployment to Azure

```bash
# Deploy to Azure Static Web Apps
pnpm deploy
```

Or use GitHub Actions / Azure DevOps pipelines.

## Module Federation Details

### Shell Configuration

```typescript
// apps/shell/vite.config.ts
federation({
  name: 'shell',
  remotes: {
    billing: 'http://localhost:4280/billing/assets/remoteEntry.js',
    reports: 'http://localhost:4280/reports/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom'],
})
```

### Remote Configuration

```typescript
// apps/remote-billing/vite.config.ts
federation({
  name: 'billing',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App.tsx',
    './bootstrap': './src/bootstrap.tsx',
  },
  shared: ['react', 'react-dom'],
})
```

### Loading Remotes Dynamically

The shell uses `bootstrap.tsx` from each remote to mount/unmount apps:

```typescript
const { mount, unmount } = await import('billing/bootstrap');
const root = mount('app-container');
// Later: unmount(root);
```

## Contributing

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules (`pnpm lint`)
- Use Prettier for formatting (`pnpm format`)
- Use shadcn/ui components from `@one-portal/ui`

### Adding Features

1. Create feature branch
2. Make changes
3. Run `pnpm build` to verify
4. Run `pnpm lint` and `pnpm typecheck`
5. Submit pull request

## Troubleshooting

### CSS Not Working

If Tailwind classes aren't applying:
1. Rebuild UI package: `pnpm build --filter=@one-portal/ui`
2. Verify `packages/ui/dist/styles.css` exists and is large (>50KB)
3. Check shell imports: `import '@one-portal/ui/styles.css'` in `main.tsx`

### Remote App Not Loading

1. Check Module Federation config in `vite.config.ts`
2. Verify remote URL in shell's `remotes` configuration
3. Check browser console for module loading errors
4. Ensure `combine-builds.js` includes your remote app

### Type Errors

```bash
# Rebuild all TypeScript declaration files
pnpm build --filter=@one-portal/types
pnpm build --filter=@one-portal/ui
```

## License

[Your License Here]
