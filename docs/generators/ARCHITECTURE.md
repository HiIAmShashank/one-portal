# Turborepo Generator Architecture

This document explains how the OnePortal remote app generator works and how to modify it for future requirements.

## Overview

The generator uses **Plop.js** (via `@turbo/gen`) to create new remote micro-frontend applications with a consistent structure and all necessary configurations.

## Generator Structure

```
turbo/generators/
├── config.ts              # Generator configuration and logic
├── package.json           # CommonJS module type specification
├── ARCHITECTURE.md        # This file
├── README.md              # User-facing documentation
└── templates/
    └── remote-app/        # Handlebars templates for all generated files
        ├── package.json.hbs
        ├── vite.config.ts.hbs
        ├── src/
        │   ├── App.tsx.hbs
        │   ├── bootstrap.tsx.hbs
        │   ├── main.tsx.hbs
        │   ├── auth/
        │   ├── components/
        │   ├── config/
        │   ├── routes/
        │   ├── types/
        │   └── debug/
        └── ...
```

## How It Works

### 1. User Invocation

```bash
pnpm turbo gen remote-app
```

This command:
1. Loads `turbo/generators/config.ts`
2. Executes the `remote-app` generator
3. Prompts user for inputs
4. Generates files from templates
5. Updates integration files (build scripts, shell navigation)

### 2. Configuration File (`config.ts`)

The main generator configuration exports a Plop generator function:

```typescript
import type { PlopTypes } from '@turbo/gen';

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('remote-app', {
    description: 'Generate a new remote application',
    prompts: [ /* ... */ ],
    actions: [ /* ... */ ]
  });
}
```

**Key sections:**
- **prompts**: Interactive questions to gather user input
- **actions**: Operations to perform (file creation, modifications)

### 3. Prompts

Prompts collect information from the user:

```typescript
{
  type: 'input',        // Type: input, confirm, list, etc.
  name: 'appName',      // Variable name for templates
  message: 'What is the app name?',
  validate: (input) => { /* validation logic */ },
  default: 'my-app'     // Optional default value
}
```

**Current prompts:**
- `appName`: Lowercase kebab-case name (e.g., "analytics")
- `displayName`: Human-readable name (e.g., "Analytics Dashboard")
- `description`: Short app description
- `displayOrder`: Navigation menu order number
- `includeDocumentation`: Include OnePortal documentation routes
- `includeExampleDashboard`: Include dashboard example with nested routes

### 4. Actions

Actions execute operations based on user inputs:

#### a. `addMany` - Generate files from templates

```typescript
{
  type: 'addMany',
  destination: '{{ turbo.paths.root }}/apps/remote-{{ appName }}',
  base: 'templates/remote-app',
  templateFiles: 'templates/remote-app/**/*',
  globOptions: { dot: true }
}
```

This copies all template files, processing Handlebars syntax.

#### b. `modify` - Update existing files

```typescript
{
  type: 'modify',
  path: '{{ turbo.paths.root }}/scripts/combine-builds.js',
  pattern: /(const APPS = \[[\s\S]*?)(\n\];)/,
  template: `$1,
  {
    name: '{{ appName }}',
    source: path.join(ROOT_DIR, 'apps/remote-{{ appName }}/dist'),
    destination: path.join(BUILD_DIR, '{{ appName }}'),
    description: '{{ displayName }} Remote App'
  }
$2`
}
```

This uses regex to insert app configuration into build scripts.

#### c. Custom functions

```typescript
function(answers) {
  console.log('Next steps...');
  return 'Generator completed!';
}
```

Used for post-generation messages and custom logic.

## Handlebars Template Syntax

Templates use Handlebars syntax for variable substitution:

### Basic Variable Substitution

```handlebars
{{ appName }}          → User input directly
{{ displayName }}      → User input with spaces
{{ description }}      → User input description
{{ displayOrder }}     → Numeric display order
```

### Helper Functions

Plop provides built-in helper functions:

```handlebars
{{ properCase appName }}     → "analytics" → "Analytics"
{{ constantCase appName }}   → "analytics" → "ANALYTICS"
{{ camelCase appName }}      → "my-app" → "myApp"
{{ pascalCase appName }}     → "my-app" → "MyApp"
{{ kebabCase displayName }}  → "Analytics Dashboard" → "analytics-dashboard"
```

### Conditionals

```handlebars
{{#if includeDocumentation}}
  // Documentation routes
{{/if}}

{{#unless includeExampleDashboard}}
  // Simple home route
{{/unless}}
```

### Loops

```handlebars
{{#each menuItems}}
  <MenuItem name="{{ this.name }}" path="{{ this.path }}" />
{{/each}}
```

### Built-in Variables

- `{{ turbo.paths.root }}`: Monorepo root directory
- `{{ turbo.paths.workspace }}`: Current workspace directory

## Template File Organization

### Configuration Files

Located at root of generated app:
- `package.json.hbs`: Dependencies, scripts, workspace configuration
- `vite.config.ts.hbs`: Vite + Module Federation + plugins
- `tsconfig.json.hbs`: TypeScript configuration
- `eslint.config.js.hbs`: ESLint rules
- `.env.local.example.hbs`: Environment variable template
- `.gitignore.hbs`: Git ignore patterns

### Source Files

#### Core (`src/`)
- `App.tsx.hbs`: Router and QueryClient setup
- `bootstrap.tsx.hbs`: Module Federation mount/unmount
- `main.tsx.hbs`: Standalone entry point with auth provider

#### Authentication (`src/auth/`)
- `msalInstance.ts.hbs`: MSAL instance factory

#### Components (`src/components/`)
- `AppLayout.tsx.hbs`: Layout with sidebar
- `AppSidebar.tsx.hbs`: Navigation sidebar
- `AppBreadcrumb.tsx.hbs`: Breadcrumb navigation

#### Configuration (`src/config/`)
- `routes.ts.hbs`: Public routes configuration
- `menu.ts.hbs`: Menu structure and helpers

#### Types (`src/types/`)
- `menu.ts.hbs`: TypeScript type definitions

#### Routes (`src/routes/`)
- `__root.tsx.hbs`: Root route with auth guard
- `index.tsx.hbs`: Home page (varies by mode)
- `sign-in.tsx.hbs`: Sign-in page
- `auth/callback.tsx.hbs`: OAuth callback
- `dashboard.tsx.hbs`: Dashboard layout (conditional)
- `dashboard/*.tsx.hbs`: Dashboard sub-routes (conditional)
- `*.tsx.hbs`: Documentation routes (conditional)

#### Debug (`src/debug/`)
- `authDebug.ts.hbs`: Development debugging utilities

## Conditional File Generation

### Documentation Mode

When `includeDocumentation: true`:
- 8 documentation routes explaining OnePortal
- Menu configured with doc navigation
- Index page with OnePortal welcome

**Routes generated:**
- `/getting-started`
- `/repository`
- `/tech-stack`
- `/components`
- `/datatable`
- `/routing`
- `/styling`

### Dashboard Mode

When `includeExampleDashboard: true`:
- Dashboard layout route
- 4 nested dashboard routes
- Menu with dashboard navigation

**Routes generated:**
- `/dashboard` (layout)
- `/dashboard/` (index)
- `/dashboard/events`
- `/dashboard/tasks`
- `/dashboard/workflows`

### Minimal Mode

When both flags are `false`:
- Simple home and about routes
- Basic menu structure
- Minimal boilerplate

## Integration Updates

### Build Script (`scripts/combine-builds.js`)

The generator inserts a new app entry:

```javascript
const APPS = [
  { name: 'shell', ... },
  { name: 'domino', ... },
  {
    name: 'new-app',
    source: path.join(ROOT_DIR, 'apps/remote-new-app/dist'),
    destination: path.join(BUILD_DIR, 'new-app'),
    description: 'New App Remote App'
  }
];
```

### Shell Navigation

The generator updates two shell files:

1. **`apps/shell/src/routes/__root.tsx`**: Adds app to navigation array
2. **`apps/shell/src/routes/apps.$appId.tsx`**: Adds app to route loader

Pattern matching uses regex to find the `mockApps` array and insert new entry.

## Common Customization Patterns

### Adding a New Prompt

```typescript
prompts: [
  // ... existing prompts
  {
    type: 'confirm',
    name: 'includeTests',
    message: 'Include test setup with Vitest?',
    default: true
  }
]
```

### Adding Conditional Template Logic

```handlebars
{{#if includeTests}}
import { describe, it, expect } from 'vitest';

describe('{{ displayName }}', () => {
  it('should render', () => {
    expect(true).toBe(true);
  });
});
{{/if}}
```

### Adding a New Template File

1. Create template: `turbo/generators/templates/remote-app/src/utils/helpers.ts.hbs`
2. The `addMany` action will automatically include it
3. Use Handlebars syntax for dynamic content

### Modifying Existing Integration Points

If you need to update additional files (e.g., root `package.json`):

```typescript
actions: [
  // ... existing actions
  {
    type: 'modify',
    path: '{{ turbo.paths.root }}/package.json',
    pattern: /(\"workspaces\": \[[\s\S]*?)(\"apps\/\*\")/,
    template: '$1$2,\n    "apps/remote-{{ appName }}"'
  }
]
```

## Testing the Generator

### Manual Testing

1. **Generate app with minimal config:**
   ```bash
   pnpm turbo gen remote-app
   # Answer prompts with minimal options
   ```

2. **Verify file structure:**
   ```bash
   ls -la apps/remote-{name}/
   ```

3. **Install dependencies:**
   ```bash
   cd apps/remote-{name}
   pnpm install
   ```

4. **Test development mode:**
   ```bash
   pnpm dev
   # Should start on port 5173
   # Check http://localhost:5173
   ```

5. **Test build:**
   ```bash
   pnpm build
   # Verify dist/ directory created
   # Verify remoteEntry.js exists
   ```

6. **Test integration:**
   ```bash
   cd ../..
   pnpm build:deploy
   pnpm swa:start
   # Check http://localhost:4280/apps/{name}
   ```

### Verification Checklist

- [ ] All template files generated correctly
- [ ] No Handlebars syntax left unprocessed
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] App runs in standalone mode
- [ ] App loads in shell
- [ ] Authentication works
- [ ] Navigation works
- [ ] Build script updated correctly
- [ ] Shell navigation updated correctly

## Troubleshooting

### Template Not Rendering

**Problem:** Handlebars syntax visible in generated files

**Solution:**
- Check variable names match prompt `name` fields
- Verify conditional syntax: `{{#if}}` not `{{if}}`
- Check template file has `.hbs` extension

### Integration Update Failed

**Problem:** Regex pattern didn't match existing file

**Solution:**
- Check the pattern regex in action
- Verify target file structure hasn't changed
- Test regex with current file content
- Consider more flexible regex or different approach

### Generated App Fails to Build

**Problem:** TypeScript errors or missing dependencies

**Solution:**
- Verify `package.json.hbs` has all required dependencies
- Check TypeScript path mappings in `tsconfig.json.hbs`
- Verify imports match actual package exports
- Check for typos in template files

### Generator Command Not Found

**Problem:** `pnpm turbo gen remote-app` fails

**Solution:**
- Verify `@turbo/gen` is installed: `pnpm add -D @turbo/gen -w`
- Check `turbo/generators/config.ts` exports correctly
- Verify `turbo.json` includes generator configuration

## Best Practices

1. **Keep templates DRY**: Use conditionals instead of duplicating templates
2. **Validate user inputs**: Add comprehensive validation to prompts
3. **Provide good defaults**: Make it easy to accept defaults and move forward
4. **Document everything**: Templates should include comments explaining purpose
5. **Test thoroughly**: Test all combinations of conditional flags
6. **Version dependencies**: Keep template dependencies in sync with monorepo
7. **Handle edge cases**: Consider what happens with special characters in names
8. **Provide clear feedback**: Custom actions should log progress and next steps

## References

- [Turborepo Generators Documentation](https://turbo.build/repo/docs/core-concepts/monorepos/code-generation)
- [Plop.js Documentation](https://plopjs.com/documentation/)
- [Handlebars Documentation](https://handlebarsjs.com/guide/)
- [OnePortal CLAUDE.md](../../CLAUDE.md) - Project conventions and patterns

## Maintenance

### When to Update the Generator

- New OnePortal pattern emerges (update templates)
- Dependency versions change (update `package.json.hbs`)
- Authentication flow changes (update `bootstrap.tsx.hbs`, `__root.tsx.hbs`)
- Build process changes (update `vite.config.ts.hbs`, update build script integration)
- New shared packages added (update imports in templates)

### Version History

- **v1.0** (Initial): Basic remote app with old MSAL pattern
- **v2.0** (Current): Complete rewrite with:
  - UnifiedAuthProvider pattern
  - Full layout system
  - Menu configuration
  - Documentation mode
  - Dashboard examples
  - Tailwind v4 integration
  - Complete TypeScript types

## Future Enhancements

Potential future additions:
- [ ] Test setup option (Vitest + React Testing Library)
- [ ] E2E test option (Playwright)
- [ ] API integration example (REST/GraphQL)
- [ ] State management option (Zustand/Redux)
- [ ] Form handling option (React Hook Form/Formik)
- [ ] Internationalization option (i18next)
- [ ] Analytics integration option
- [ ] Error boundary templates
- [ ] Loading state templates
- [ ] Accessibility enhancements
