import type { PlopTypes } from '@turbo/gen';
import * as fs from 'node:fs';
import * as path from 'node:path';

module.exports = function generator(plop: PlopTypes.NodePlopAPI): void {
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
    ],
    actions: [
      // Create the app directory and files from template
      {
        type: 'addMany',
        destination: '{{ turbo.paths.root }}/apps/remote-{{ appName }}',
        base: 'templates/remote-app',
        templateFiles: 'templates/remote-app/**/*',
      },
      // Update scripts/combine-builds.js
      {
        type: 'modify',
        path: '{{ turbo.paths.root }}/scripts/combine-builds.js',
        pattern: /(const APPS = \[[\s\S]*?)(\];)/,
        template: `$1  {
    name: '{{ appName }}',
    srcDir: path.join(ROOT_DIR, 'apps/remote-{{ appName }}/dist'),
    destSubDir: '{{ appName }}',
    displayName: '{{ displayName }} Remote App',
  },
$2`,
      },
      // Update shell configuration
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
      // Custom action to display next steps
      function (answers: { appName?: string }) {
        const appName = answers.appName || 'unknown';
        console.log('\n✅ Remote app created successfully!\n');
        console.log('📁 Location:', `apps/remote-${appName}`);
        console.log('\n🚀 Next steps:');
        console.log(`   1. cd apps/remote-${appName}`);
        console.log('   2. Start developing in src/App.tsx');
        console.log('   3. Test standalone: pnpm dev');
        console.log('   4. Build and test: pnpm build (from root)');
        console.log('   5. Combine builds: node scripts/combine-builds.js (from root)');
        console.log('   6. Start shell: pnpm swa:start (from root)\n');
        return 'Generator completed!';
      },
    ],
  });
}
