# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OnePortal is a micro-frontend portal built with Module Federation, Turborepo, React 19, and Tailwind CSS v4. The architecture uses a **Shell application** that dynamically loads **Remote applications** (micro-frontends) at runtime. Authentication is handled via Azure AD/MSAL with SSO across all apps.

**Key Technologies:**
- Turborepo monorepo with pnpm workspaces
- Vite with @originjs/vite-plugin-federation for Module Federation
- React 19 with @tanstack/react-router
- Tailwind CSS v4 with centralized design system
- Azure AD authentication with @azure/msal-browser
- Deployed to Azure Static Web Apps

## Essential Commands

### Development
```bash
# Start all apps in development
pnpm dev

# Start specific app only
pnpm --filter @one-portal/shell dev
pnpm --filter @one-portal/remote-domino dev

# Start with Azure SWA emulator (after build)
pnpm swa:start

# Build all apps and packages
pnpm build

# Build and prepare for deployment
pnpm build:deploy
```

### Testing & Quality
```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Dead code analysis with Knip
pnpm deadcode

# Format code
pnpm format
```

### Generate New Remote App
```bash
# Use Turborepo generator to scaffold new remote app
pnpm turbo gen remote-app

# Follow prompts for app name, display name, description, display order
# Generator automatically creates app structure and updates shell navigation
```

### Docker
```bash
# Build and start with Docker
pnpm docker:up

# View logs
pnpm docker:logs

# Stop containers
pnpm docker:down
```

### Storybook (Component Documentation)
```bash
# Start Storybook dev server
pnpm storybook

# Build static Storybook
pnpm build-storybook

# Storybook runs at http://localhost:6006
```

**Important:** Storybook is located at `apps/storybook/` and is **excluded from deployment** builds. It's for development and documentation only.

## Architecture Deep Dive

### Module Federation Flow

**Shell (Host) Behavior:**
1. Shell app runs at `http://localhost:5000` in dev, port 4280 with SWA emulator
2. Vite config defines remotes in `apps/shell/vite.config.ts`:
   - Dev: `http://localhost:5173/assets/remoteEntry.js`
   - Prod: `/domino/assets/remoteEntry.js`
3. Shell uses `remoteLoader.ts` service to load/mount/unmount remotes dynamically
4. Remotes are mounted via their `bootstrap.tsx` export

**Remote (Micro-frontend) Behavior:**
1. Each remote exposes `./App` and `./bootstrap` via Module Federation
2. `bootstrap.tsx` exports `mount()` and `unmount()` functions
3. Remote runs standalone at `http://localhost:5173` for isolated development
4. In production, remote builds to `/domino/` with `remoteEntry.js` in assets folder

**Critical: Shared Dependencies**
Shell and remotes must share these as singletons to prevent duplication:
- `react` and `react-dom` (version ^19.2.0)
- `@tanstack/react-query` - Shared query cache across apps
- `@tanstack/react-router` - Shared router utilities
- `lucide-react` - Icon library (~158 kB gzipped when shared)
- `zustand` - State management (shell only)

**Note:** Proper shared dependency configuration reduces bundle sizes by ~50-60%. All remote apps inherit these from the shell in production.

### Authentication Architecture

The `@one-portal/auth` package provides unified authentication for all apps.

**Host Mode (Shell):**
- Uses `UnifiedAuthProvider` with `mode="host"`
- Handles OAuth redirect flow
- Publishes authentication events via BroadcastChannel
- Shows loading spinner during initial auth

**Remote Mode (Micro-frontends):**
- Uses `UnifiedAuthProvider` with `mode="remote"`
- Performs SSO silent authentication
- Subscribes to Shell's authentication events
- Detects embedded vs standalone mode

**Key Files:**
- Each app has `src/auth/msalInstance.ts` using `createMsalInstanceWithConfig(appName)`
- Provider wraps app in `main.tsx` (host) or `bootstrap.tsx` (remote)
- Route guards use `createRouteGuard()` from `@one-portal/auth`

### CSS Architecture - Critical Understanding

OnePortal uses a **centralized CSS system** that eliminates duplication:

**Structure:**
```
packages/ui/
├── src/index.css          # CSS entry (@import "tailwindcss")
├── src/theme.css          # Light/dark mode CSS variables
└── dist/styles.css        # Compiled output (exported)

apps/shell/src/main.tsx    # import '@one-portal/ui/styles.css' (unconditional)
apps/remote-*/src/main.tsx # import '@one-portal/ui/styles.css' (conditional: only in dev/preview)
```

**How it works:**
1. UI package compiles Tailwind CSS once to `dist/styles.css`
2. Shell imports compiled CSS unconditionally
3. Remote apps import conditionally (only for standalone dev mode)
4. In production, remotes inherit CSS from shell (no duplication)

**Important:** Remote apps DO NOT need:
- Their own `tailwind.config.ts`
- Individual CSS files
- Separate Tailwind build process

**To add new shadcn/ui components:**
```bash
cd packages/ui
pnpm dlx shadcn@latest add button card dialog
```

### Deployment Build Process

The `scripts/combine-builds.js` script prepares deployment:
1. Clears `dist-deploy/` directory
2. Copies shell build to root of `dist-deploy/`
3. Copies each remote build to `dist-deploy/{remoteName}/`
4. Verifies `remoteEntry.js` files exist
5. Copies `staticwebapp.config.json`

**Result structure:**
```
dist-deploy/
├── index.html              # Shell
├── assets/                 # Shell assets
├── domino/
│   └── assets/
│       └── remoteEntry.js  # Domino remote
└── staticwebapp.config.json
```

## TypeScript Configuration

OnePortal uses a unified TypeScript configuration across all workspaces:

**Strict Mode Enabled:**
- `strict: true` - All strict type-checking enabled
- `noUncheckedIndexedAccess: true` - Array access returns `T | undefined`
- `noImplicitAny: true` - No implicit any types

**Path Mappings:**
All apps include wildcard path mappings for workspace packages:
```json
{
  "paths": {
    "@one-portal/auth/*": ["../../packages/auth/src/*"],
    "@one-portal/config/*": ["../../packages/config/src/*"],
    "@one-portal/types/*": ["../../packages/types/src/*"],
    "@one-portal/ui/*": ["../../packages/ui/src/*"]
  }
}
```

This enables proper subpath imports like:
```typescript
import { isAuthError } from '@one-portal/auth/utils';
import { createQueryClient } from '@one-portal/config';
```

**Important:** Always use `unknown` instead of `any` for error types and external data. Use type guards to narrow types.

## Turborepo Task Pipeline

Turborepo manages build orchestration with caching:

**Task Dependencies:**
- `build` depends on `^build` (build dependencies first)
- `typecheck` depends on `^build` (needs type declarations)
- `test` depends on `^build` (needs compiled packages)
- `preview` depends on `build` (needs production build)

**Persistent Tasks:**
- `dev` - Never cached, runs continuously
- `test:watch` - Never cached, runs continuously

**Cached Tasks:**
- `build`, `lint`, `typecheck`, `test` - Fully cached based on inputs

**Outputs:**
- Build outputs to `dist/**` in each package/app
- Type declarations in `dist/` folders
- Test coverage in `coverage/`

## Package Structure & Responsibilities

### `packages/auth`
Unified authentication package with MSAL integration:
- `UnifiedAuthProvider` - Single provider for host and remote modes
- `AuthErrorHandler` - Centralized error handling with toast notifications
- `createMsalInstance()` - Factory for MSAL instance creation
- Event system for cross-app auth communication
- Route guards for protected routes

**Key Exports:**
```typescript
import { UnifiedAuthProvider } from '@one-portal/auth';
import { AuthErrorHandler } from '@one-portal/auth';
import { createMsalInstanceWithConfig } from '@one-portal/auth';
import { publishAuthEvent, subscribeToAuthEvents } from '@one-portal/auth/events';
import { createRouteGuard } from '@one-portal/auth';
```

### `packages/ui`
Shared UI component library:
- Exports React components AND compiled CSS
- Built with shadcn/ui components
- Uses Tailwind CSS v4 with `@theme` directive
- Includes DataTable, Button, Card, Dialog, etc.

**Key Exports:**
```typescript
import { Button, Card, DataTable } from '@one-portal/ui';
import '@one-portal/ui/styles.css'; // Compiled CSS
```

### `packages/types`
Shared TypeScript types and validators:
- Config types (`ShellConfig`, `RemoteAppConfig`)
- Storage keys constants
- Zod validators for runtime validation

### `packages/config`
Shared configuration and utilities:
- **ESLint configuration** - Shared linting rules across workspace
- **React Query client factory** - `createQueryClient()` with auth-aware retry logic
- **Environment validators** - Zod schemas for environment variables

**Key Exports:**
```typescript
import { createQueryClient } from '@one-portal/config';
import { validateShellEnv } from '@one-portal/config';

// Create QueryClient with auth error handling
const queryClient = createQueryClient({
  shouldSkipRetry: isAuthError
});
```

### localStorage Key Conventions

OnePortal uses a consistent namespace pattern for all localStorage keys:

**Pattern:** `oneportal:{module}:{identifier}:{property}`

**Examples:**
- `oneportal:auth:returnUrl` - Auth redirect URL
- `oneportal:datatable:users-table:state` - DataTable column preferences
- `oneportal:datatable:users-table:density` - DataTable UI density
- `oneportal:datatable:users-table:filterMode` - DataTable filter mode

**Important:** Always use the provided storage utilities from `@one-portal/auth` or `@one-portal/ui` to maintain consistency. Direct `localStorage` calls should follow this naming convention.

## Working with Remote Apps

### Creating New Remote App

1. **Run generator:**
   ```bash
   pnpm turbo gen remote-app
   ```

2. **What gets created:**
   - New app in `apps/remote-{name}/`
   - `src/App.tsx` - Main component
   - `src/bootstrap.tsx` - Module Federation mount/unmount
   - `src/main.tsx` - Standalone entry point
   - `vite.config.ts` - Federation config exposing `./App` and `./bootstrap`
   - `package.json` with workspace dependencies

3. **What gets updated:**
   - `scripts/combine-builds.js` - Adds remote to deployment
   - Shell navigation menu (manual step may be needed)

4. **DON'T add:**
   - Tailwind config files
   - CSS imports beyond conditional `@one-portal/ui/styles.css`
   - Duplicate Tailwind dependencies

### Remote App Bootstrap Pattern

Every remote must export `mount()` and `unmount()`:

```typescript
// apps/remote-{name}/src/bootstrap.tsx
export async function mount(containerId: string): Promise<Root> {
  const container = document.getElementById(containerId);
  if (!container) throw new Error(`Container "${containerId}" not found`);

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <UnifiedAuthProvider
        msalInstance={msalInstance}
        mode="remote"
        appName="{name}"
        getAuthConfig={getAuthConfig}
      >
        <App />
      </UnifiedAuthProvider>
    </StrictMode>
  );
  return root;
}

export function unmount(root: Root): void {
  root.unmount();
}
```

### Shell Remote Loading

Shell uses `remoteLoader.ts` service:

```typescript
import { loadAndMountRemote, unmountRemote } from '@/services/remoteLoader';

// Load and mount
const root = await loadAndMountRemote(
  '/domino/assets/remoteEntry.js',
  'domino',
  'app-container'
);

// Later, unmount
unmountRemote('domino');
```

## Storybook - DataTable Component Documentation

OnePortal includes a comprehensive Storybook app at `apps/storybook/` that documents all DataTable component features.

### Running Storybook

```bash
# Start development server
pnpm storybook

# Build static site
pnpm build-storybook

# Access at http://localhost:6006
```

### Structure

```
apps/storybook/
├── .storybook/          # Storybook configuration
│   ├── main.ts          # Vite builder, addons, stories location
│   ├── preview.tsx      # Global decorators, theme provider
│   └── storybook.css    # Custom Storybook styles
├── src/
│   ├── stories/         # Story files organized by feature
│   │   ├── DataTableV2/ # DataTable V2 feature stories
│   │   └── Welcome.stories.tsx
│   └── mocks/           # Mock data infrastructure
│       ├── data-generators.ts   # Faker.js data generators
│       └── column-definitions.tsx  # Reusable column configs
├── package.json
└── tsconfig.json
```

### Mock Data Generators

Located in `src/mocks/data-generators.ts`, provides realistic test data:

- **Users**: name, email, role, status, avatar, department
- **Orders**: order number, customer, amount, status, date
- **Products**: SKU, price, stock, category, supplier
- **Transactions**: debits/credits with running balances
- **Tasks**: priorities, statuses, due dates, tags

```typescript
import { generateUsers, generateOrders } from '@/mocks/data-generators';

const users = generateUsers(50);  // Generate 50 realistic users
const orders = generateOrders(100); // Generate 100 orders
```

### Column Definitions

Located in `src/mocks/column-definitions.tsx`, provides reusable column configs:

- Custom cell renderers (badges, avatars, formatted currency/dates)
- Filter configurations (select, multi-select, date-range, number-range)
- Inline editing configurations
- Aggregation functions for grouping
- Sort functions and conditional styling

```typescript
import { userColumns, orderColumns } from '@/mocks/column-definitions';

<DataTable data={users} columns={userColumns} />
```

### Story Categories

Stories are organized by feature area:

1. **Basic Features** - Sorting, filtering, pagination, search
2. **Advanced Features** - Inline editing, grouping, expanding, server-side
3. **Column Features** - Resizing, reordering, pinning, visibility
4. **Selection & Actions** - Row selection, bulk actions, per-row actions
5. **UI Variations** - Density, themes, filter modes, variants
6. **Real-World Examples** - Users, orders, products, financial data
7. **Persistence & State** - localStorage, controlled/uncontrolled modes

### Deployment Exclusion

**IMPORTANT:** Storybook is automatically excluded from production deployment:

- `scripts/combine-builds.js` does NOT include storybook
- `pnpm build:deploy` ignores storybook app
- Only used for development and documentation

### Progress Tracking

See `docs/STORYBOOK_CHECKLIST.md` for implementation progress. This file tracks:
- Completed phases and tasks
- Current implementation status
- Next steps for story development

## Common Development Patterns

### Adding New Routes

**Shell routes:**
- File-based routing with TanStack Router
- Routes in `apps/shell/src/routes/`
- Protected routes use route guards
- Generate route tree: `pnpm --filter shell dev` (auto-generates `routeTree.gen.ts`)

**Remote routes:**
- Each remote has its own TanStack Router instance
- Routes in `apps/remote-{name}/src/routes/`
- Route tree auto-generated during dev/build

### Environment Variables

Each app needs `.env.local` with:
```bash
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_REDIRECT_URI=http://localhost:4280/auth/callback
VITE_AUTH_SCOPES=openid,profile,email,User.Read
```

Use `.env.local.example` as template in each app.

### Error Handling with AuthErrorHandler

```typescript
import { AuthErrorHandler } from '@one-portal/auth';

// Process and show error
const processed = AuthErrorHandler.process(error, 'Sign-in');
AuthErrorHandler.show(processed, {
  severity: 'error',
  showRetry: true,
  onRetry: () => handleRetry()
});

// Or wrap promise
const token = await AuthErrorHandler.showPromise(
  acquireToken(instance, ['User.Read']),
  { loadingMessage: 'Acquiring token...' }
);
```

### Using DataTable from @one-portal/ui

The UI package includes a feature-rich DataTable component:

```typescript
import { DataTable } from '@one-portal/ui';

<DataTable
  data={items}
  columns={columnDefs}
  enableFilters
  enableSorting
  enablePagination
  enableColumnVisibility
  persistState={true}
  stateKey="my-table"
/>
```

## Testing

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Specific package
pnpm --filter @one-portal/auth test
```

### Test Configuration

- Test runner: Vitest
- Setup file: `tests/setup.ts`
- Config: `vitest.config.ts` (root level)
- Environment: jsdom for React components
- Coverage: V8 provider

### Writing Tests

Tests go in:
- `packages/{package}/src/**/*.test.ts(x)` for unit tests
- `tests/**/*.test.ts(x)` for integration tests

## Performance & Bundle Sizes

OnePortal is optimized for production performance:

**Production Build Configuration:**
- Minification enabled (esbuild)
- Shared dependencies deduplicated via Module Federation
- CSS code-split disabled for consistent styling
- Target: ESNext for modern browsers

**Current Bundle Sizes (production):**
- Shell app: ~710 kB raw (~202 kB gzipped)
- Remote apps: ~481 kB raw (~129 kB gzipped)
- Shared React Query: 45 kB (~13 kB gzipped)
- Shared React Router: 88 kB (~28 kB gzipped)
- Shared Lucide Icons: 868 kB (~158 kB gzipped)

**Performance Best Practices:**
1. Always configure shared dependencies in `vite.config.ts`
2. Use dynamic imports for code-splitting when needed
3. Leverage Turborepo caching for faster builds
4. Monitor bundle sizes with Vite's build output

## Build & Deployment Checklist

Before deploying, verify:

1. **Build succeeds:**
   ```bash
   pnpm build
   ```

2. **Type checking passes:**
   ```bash
   pnpm typecheck
   ```

3. **Linting passes:**
   ```bash
   pnpm lint
   ```

4. **Dead code check:**
   ```bash
   pnpm deadcode
   ```

5. **Combine builds:**
   ```bash
   node scripts/combine-builds.js
   ```

6. **Test with SWA emulator:**
   ```bash
   pnpm swa:start
   # Visit http://localhost:4280
   ```

7. **Verify remote apps load:**
   - Navigate to each remote app route
   - Check browser console for Module Federation errors
   - Verify authentication works across shell and remotes

## Port Allocations

- **Shell dev:** 5000
- **Remote apps dev:** 5173 (all remotes use same port when running standalone)
- **SWA emulator:** 4280
- **Shell preview:** 4173

## Common Issues & Solutions

### CSS not applying in remote app
**Cause:** Remote isn't loading styles from shell
**Fix:** Verify conditional import in remote's `main.tsx`:
```typescript
if (import.meta.env.DEV || import.meta.env.MODE === 'preview') {
  await import('@one-portal/ui/styles.css');
}
```

### Remote app fails to load in shell
**Cause:** Module Federation configuration mismatch
**Fix:**
1. Check shell's `vite.config.ts` remotes config
2. Verify remote's `vite.config.ts` exposes `./bootstrap`
3. Check `scripts/combine-builds.js` includes remote
4. Verify `remoteEntry.js` exists in remote's `dist/assets/`

### Authentication flickering
**Cause:** MSAL cache check failing
**Fix:** Verify `UnifiedAuthProvider` receives `getAuthConfig` prop in both shell and remote

### Type errors after package changes
**Cause:** Stale type declarations
**Fix:**
```bash
pnpm --filter @one-portal/types build
pnpm --filter @one-portal/ui build
```

### Turbo cache issues
**Cause:** Stale cache after major changes
**Fix:**
```bash
turbo clean
pnpm build
```

## Code Generation

### Turborepo Generator

Located in `turbo/generators/`:
- `config.ts` - Generator configuration with prompts and actions
- `templates/remote-app/` - 25+ Handlebars template files for complete app structure

**Generator Creates:**
- Complete app structure with authentication (MSAL), routing (TanStack Router), and layout
- Modern patterns: UnifiedAuthProvider, createProtectedRouteGuard, factory patterns
- Three generation modes:
  1. **Documentation Mode** - Menu structure for OnePortal documentation (8 items)
  2. **Dashboard Mode** - Menu structure with nested routes (4 items)
  3. **Minimal Mode** - Basic menu (home and about)
- Shell integration: Automatically updates combine-builds.js and shell navigation

**Variables available in templates:**
- `{{appName}}` - Lowercase name (e.g., "billing")
- `{{displayName}}` - Display name (e.g., "Billing")
- `{{description}}` - App description
- `{{displayOrder}}` - Menu order number
- `{{includeDocumentation}}` - Boolean for documentation mode
- `{{includeExampleDashboard}}` - Boolean for dashboard mode (skipped if documentation=true)

**Generator Documentation:**
- `docs/generators/README.md` - User guide with usage examples and troubleshooting
- `docs/generators/ARCHITECTURE.md` - Technical guide for modifying the generator

## Specs & Documentation

**Design Specifications** (`specs/` directory):
- `001-front-end-host/` - Initial shell architecture
- `002-add-single-sign/` - SSO authentication design
- `003-monorepo-css-isolation/` - Centralized CSS architecture

**Project Documentation** (`docs/` directory):
- `docs/generators/` - Turborepo generator documentation
- `docs/DATATABLE_V2_PROGRESS.md` - DataTable V2 implementation tracking
- `docs/STORYBOOK_CHECKLIST.md` - Storybook story implementation progress
- `docs/IMPROVEMENT_SUMMARY.md` - Historical improvements and decisions
- Other technical documentation and analysis files

Reference these when making architectural changes or understanding implementation details.

## Important Notes

1. **Never manually edit `routeTree.gen.ts`** - Auto-generated by TanStack Router
2. **Always use workspace protocol** - Dependencies use `workspace:*` not version numbers
3. **CSS compiled once** - Only `packages/ui` compiles Tailwind, apps import compiled CSS
4. **Shared dependencies must match** - React, React DOM versions must be identical across all apps
5. **Remote apps are independent** - Each remote can run standalone for development
6. **Authentication events via BroadcastChannel** - Shell publishes, remotes subscribe
7. **Use Knip to prevent dead code** - Runs in CI, catches unused exports/dependencies
8. **Bootstrap pattern required** - All remotes must export `mount()` and `unmount()`

## Package Manager

**Always use pnpm** (version 10.19.0 specified in package.json)

- `pnpm install` - Install dependencies
- `pnpm add {package}` - Add dependency to root
- `pnpm --filter {workspace} add {package}` - Add to specific workspace
- Turborepo tasks automatically filter to correct workspaces
