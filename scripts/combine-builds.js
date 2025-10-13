#!/usr/bin/env node
/**
 * Combines individual app builds into a single deployment directory
 * for Azure Static Web Apps single-instance deployment.
 * 
 * Structure:
 * dist-deploy/
 * ├── [shell files at root]
 * ├── billing/
 * │   └── assets/remoteEntry.js
 * └── reports/
 *     └── assets/remoteEntry.js
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, 'dist-deploy');

const APPS = [
  {
    name: 'shell',
    source: path.join(ROOT_DIR, 'apps/shell/dist'),
    destination: BUILD_DIR, // Shell goes to root
    description: 'Shell (Host Application)'
  },
  {
    name: 'billing',
    source: path.join(ROOT_DIR, 'apps/remote-billing/dist'),
    destination: path.join(BUILD_DIR, 'billing'),
    description: 'Billing Remote App'
  },
  {
    name: 'reports',
    source: path.join(ROOT_DIR, 'apps/remote-reports/dist'),
    destination: path.join(BUILD_DIR, 'reports'),
    description: 'Reports Remote App'
  },
  {
    name: 'testgenerator1',
    source: path.join(ROOT_DIR, 'apps/remote-testgenerator1/dist'),
    destination: path.join(BUILD_DIR, 'testgenerator1'),
    description: 'Test Gen 1 Remote App'
  }

];

async function combineBuilds() {
  console.log('🔧 Starting build combination...\n');

  // Step 1: Clean previous build
  console.log('🧹 Cleaning previous deployment build...');
  await fs.emptyDir(BUILD_DIR);
  console.log('✅ Cleaned dist-deploy/\n');

  // Step 2: Verify all source directories exist
  console.log('🔍 Verifying source builds...');
  for (const app of APPS) {
    const exists = await fs.pathExists(app.source);
    if (!exists) {
      console.error(`❌ Error: ${app.name} build not found at ${app.source}`);
      console.error('   Run "pnpm build" first!');
      process.exit(1);
    }
    console.log(`   ✓ ${app.description}: ${app.source}`);
  }
  console.log('✅ All source builds verified\n');

  // Step 3: Copy each app to destination
  console.log('📦 Copying builds...');
  for (const app of APPS) {
    console.log(`   Copying ${app.description}...`);
    await fs.copy(app.source, app.destination, {
      overwrite: true,
      errorOnExist: false
    });
    console.log(`   ✓ ${app.name} → ${path.relative(ROOT_DIR, app.destination)}`);
  }
  console.log('✅ All builds copied\n');

  // Step 4: Verify remoteEntry.js files exist
  console.log('🔍 Verifying Module Federation entry points...');
  const remotes = APPS.filter(app => app.name !== 'shell');
  for (const remote of remotes) {
    const remoteEntryPath = path.join(remote.destination, 'assets/remoteEntry.js');
    const exists = await fs.pathExists(remoteEntryPath);
    if (!exists) {
      console.error(`❌ Warning: remoteEntry.js not found for ${remote.name}`);
      console.error(`   Expected at: ${remoteEntryPath}`);
    } else {
      console.log(`   ✓ ${remote.name}/assets/remoteEntry.js`);
    }
  }
  console.log('✅ Remote entry points verified\n');

  // Step 5: Copy staticwebapp.config.json
  console.log('📋 Copying Azure SWA configuration...');
  const configSource = path.join(ROOT_DIR, 'staticwebapp.config.json');
  const configDest = path.join(BUILD_DIR, 'staticwebapp.config.json');
  
  if (fs.existsSync(configSource)) {
    fs.copyFileSync(configSource, configDest);
    console.log('   ✓ staticwebapp.config.json copied');
  } else {
    console.log('   ⚠ staticwebapp.config.json not found (optional)');
  }
  console.log('✅ Configuration copied\n');
  console.log('✅ Build combination complete!\n');
  console.log('🚀 Ready to deploy with:');
  console.log('   swa start dist-deploy --port 4280\n');
}

// Run the script
combineBuilds().catch(error => {
  console.error('❌ Error combining builds:', error);
  process.exit(1);
});
