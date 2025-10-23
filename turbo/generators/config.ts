import type { PlopTypes } from '@turbo/gen';
import * as fs from 'node:fs';
import * as path from 'node:path';

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('remote-app', {
    description: 'Generate a new remote application (micro-frontend) for One Portal',
    prompts: [
      {
        type: 'input',
        name: 'appName',
        message: 'What is the app name? (lowercase, no spaces, e.g., "analytics")',
        validate: (input: string) => {
          if (!input) return 'App name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(input))
            return 'App name must start with a letter and contain only lowercase letters, numbers, and hyphens';
          return true;
        },
      },
      {
        type: 'input',
        name: 'displayName',
        message: 'Display name for the app? (e.g., "Analytics Dashboard")',
        validate: (input: string) => {
          if (!input) return 'Display name is required';
          return true;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Short description of the app?',
        default: 'A remote micro-frontend application',
      },
      {
        type: 'number',
        name: 'displayOrder',
        message: 'Display order in navigation? (1, 2, 3...)',
        default: 3,
      },
      // Azure AD Authentication Configuration
      {
        type: 'input',
        name: 'clientId',
        message: 'Azure AD Application (Client) ID for this app?\n  (e.g., "8e6080c6-4da6-4f50-8ba3-eb5acd2a6b36")',
        validate: (input: string) => {
          if (!input) return 'Client ID is required';
          // GUID validation regex
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input)) {
            return 'Must be a valid GUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'authority',
        message: 'Azure AD Tenant Authority URL?\n  (e.g., "https://login.microsoftonline.com/268c06ee-...")',
        validate: (input: string) => {
          if (!input) return 'Authority URL is required';
          if (!input.startsWith('https://login.microsoftonline.com/')) {
            return 'Must start with https://login.microsoftonline.com/';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'redirectUri',
        message: 'Authentication redirect URI?',
        default: (answers: any) => `http://localhost:4280/apps/${answers.appName}/auth/callback`,
      },
      {
        type: 'input',
        name: 'postLogoutRedirectUri',
        message: 'Post-logout redirect URI?',
        default: (answers: any) => `http://localhost:4280/apps/${answers.appName}/`,
      },
      {
        type: 'input',
        name: 'scopes',
        message: 'Authentication scopes (comma-separated)?',
        default: 'User.Read',
        validate: (input: string) => {
          if (!input) return 'At least one scope is required (e.g., User.Read)';
          return true;
        },
      },
      {
        type: 'input',
        name: 'telemetryAppName',
        message: 'App name for telemetry/logging?\n  (e.g., "AR-OP-UAT-REMOTE-ANALYTICS")',
        default: (answers: any) => {
          const upperAppName = answers.appName.toUpperCase().replace(/-/g, '_');
          return `AR-OP-UAT-REMOTE-${upperAppName}`;
        },
      },
      // Optional Features
      {
        type: 'confirm',
        name: 'includeExamples',
        message: 'Include example routes demonstrating features?',
        default: true,
      },
    ],
    actions: [
      // Create the app directory and files from template
      {
        type: 'addMany',
        destination: '{{ turbo.paths.root }}/apps/remote-{{ appName }}',
        base: 'templates/remote-app',
        templateFiles: 'templates/remote-app/**/*',
        globOptions: {
          dot: true, // Include dotfiles like .env.local
        },
      },
      // Update scripts/combine-builds.js
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
$2`,
      },
      // Update shell navigation (__root.tsx)
      {
        type: 'modify',
        path: '{{ turbo.paths.root }}/apps/shell/src/routes/__root.tsx',
        pattern: /(const mockApps = \[[\s\S]*?)(\s+\];)/,
        template: `$1  {
    id: '{{ appName }}',
    name: '{{ displayName }}',
    remoteEntryUrl: '/{{ appName }}/assets/remoteEntry.js',
    moduleName: '{{ appName }}',
    scope: '{{ appName }}',
    displayOrder: {{ displayOrder }},
  },
$2`,
      },
      // Update shell route (apps.$appId.tsx)
      {
        type: 'modify',
        path: '{{ turbo.paths.root }}/apps/shell/src/routes/apps.$appId.tsx',
        pattern: /(const mockApps = \[[\s\S]*?)(\s+\];)/,
        template: `$1    {
      id: '{{ appName }}',
      name: '{{ displayName }}',
      remoteEntryUrl: '/{{ appName }}/assets/remoteEntry.js',
      moduleName: '{{ appName }}',
      scope: '{{ appName }}',
      displayOrder: {{ displayOrder }},
    },
$2`,
      },
      // Custom action to display next steps
      function (answers: { appName?: string; displayName?: string; includeExamples?: boolean }) {
        const appName = answers.appName || 'unknown';
        const displayName = answers.displayName || 'Unknown App';
        console.log('\n✅ Remote app created successfully!\n');
        console.log('📁 Location:', `apps/remote-${appName}`);
        console.log('\n� Files generated:');
        console.log('   ✓ App structure (App.tsx, bootstrap.tsx, main.tsx)');
        console.log('   ✓ Authentication setup (MSALProvider, msalInstance)');
        console.log('   ✓ Protected routing (__root.tsx with route guard)');
        if (answers.includeExamples) {
          console.log('   ✓ Example routes (index, settings, about)');
        } else {
          console.log('   ✓ Basic routing (index only)');
        }
        console.log('   ✓ .env.local with Azure AD configuration');
        console.log('   ✓ Configuration files (package.json, vite.config.ts, etc.)');
        console.log('\n🔧 Shell integration:');
        console.log('   ✓ Updated scripts/combine-builds.js');
        console.log('   ✓ Updated apps/shell navigation');
        console.log('\n🚀 Next steps:');
        console.log('   1. Review .env.local and ensure values match Azure AD app registration');
        console.log('   2. Verify redirect URIs are registered in Azure AD');
        console.log(`   3. cd apps/remote-${appName}`);
        console.log('   4. pnpm install');
        console.log('   5. pnpm dev  # Generate route tree and test standalone mode');
        console.log('   6. pnpm build  # Verify build succeeds');
        console.log('   7. cd ../..');
        console.log('   8. pnpm turbo build --force');
        console.log('   9. node scripts/combine-builds.js');
        console.log('   10. pnpm swa:start  # Test integrated mode at http://localhost:4280');
        console.log('\n⚠️  IMPORTANT:');
        console.log('   - Add .env.local to .gitignore (should already be there)');
        console.log('   - Never commit Azure AD credentials to source control');
        console.log('   - Each developer needs their own .env.local file');
        console.log('   - Update production values in Azure Static Web Apps configuration\n');
        return 'Generator completed!';
      },
    ],
  });
}
