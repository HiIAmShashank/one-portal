#!/usr/bin/env node

/**
 * Validates authentication environment configuration
 * Checks that all required .env.local files exist and have correct redirect URIs
 * 
 * Usage: node scripts/validate-auth-config.js
 */

import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const APPS = [
  {
    name: 'Shell',
    dir: 'apps/shell',
    expectedRedirectURI: {
      swa: 'http://localhost:4280/auth/callback',
      vite: 'http://localhost:5000/auth/callback',
      prod: 'https://oneportal.azurestaticapps.net/auth/callback'
    }
  },
  {
    name: 'Billing',
    dir: 'apps/remote-billing',
    expectedRedirectURI: {
      swa: 'http://localhost:4280/apps/billing/auth/callback',
      vite: 'http://localhost:5001/auth/callback',
      prod: 'https://oneportal.azurestaticapps.net/apps/billing/auth/callback'
    }
  },
  {
    name: 'Reports',
    dir: 'apps/remote-reports',
    expectedRedirectURI: {
      swa: 'http://localhost:4280/apps/reports/auth/callback',
      vite: 'http://localhost:5002/auth/callback',
      prod: 'https://oneportal.azurestaticapps.net/apps/reports/auth/callback'
    }
  }
];

let hasErrors = false;

console.log('🔍 Validating OnePortal Authentication Configuration\n');

APPS.forEach(app => {
  const envPath = join(ROOT_DIR, app.dir, '.env.local');
  const examplePath = join(ROOT_DIR, app.dir, '.env.local.example');

  console.log(`\n📦 ${app.name}`);
  console.log(`   Location: ${app.dir}`);

  // Check if .env.local exists
  if (!existsSync(envPath)) {
    console.log(`   ❌ .env.local NOT FOUND`);
    if (existsSync(examplePath)) {
      console.log(`   💡 Hint: Copy from .env.local.example and update with your Client ID`);
      console.log(`      cp ${app.dir}/.env.local.example ${app.dir}/.env.local`);
    }
    hasErrors = true;
    return;
  }

  console.log(`   ✅ .env.local found`);

  // Read and parse .env.local
  const envContent = readFileSync(envPath, 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  // Validate required variables
  const required = [
    'VITE_AUTH_CLIENT_ID',
    'VITE_AUTH_AUTHORITY',
    'VITE_AUTH_REDIRECT_URI',
    'VITE_AUTH_SCOPES',
    'VITE_AUTH_APP_NAME'
  ];

  let appHasErrors = false;

  required.forEach(varName => {
    if (!envVars[varName]) {
      console.log(`   ❌ Missing: ${varName}`);
      appHasErrors = true;
    } else if (envVars[varName].includes('your-') || envVars[varName].includes('-guid-here')) {
      console.log(`   ⚠️  ${varName} not updated (still contains placeholder)`);
      appHasErrors = true;
    } else {
      console.log(`   ✅ ${varName}: ${varName === 'VITE_AUTH_CLIENT_ID' ? '***' : envVars[varName]}`);
    }
  });

  // Check redirect URI
  if (envVars.VITE_AUTH_REDIRECT_URI) {
    const redirectURI = envVars.VITE_AUTH_REDIRECT_URI;
    const { swa, vite, prod } = app.expectedRedirectURI;

    if (redirectURI === swa) {
      console.log(`   ✅ Redirect URI configured for: SWA CLI + Docker`);
    } else if (redirectURI === vite) {
      console.log(`   ✅ Redirect URI configured for: Vite Dev Server`);
    } else if (redirectURI === prod) {
      console.log(`   ✅ Redirect URI configured for: Production (Azure SWA)`);
    } else {
      console.log(`   ⚠️  Redirect URI doesn't match expected patterns:`);
      console.log(`      Current: ${redirectURI}`);
      console.log(`      Expected (SWA):  ${swa}`);
      console.log(`      Expected (Vite): ${vite}`);
      console.log(`      Expected (Prod): ${prod}`);
      appHasErrors = true;
    }
  }

  if (appHasErrors) {
    hasErrors = true;
  }
});

console.log('\n' + '='.repeat(70));

if (hasErrors) {
  console.log('\n❌ Configuration has errors. Please fix the issues above.\n');
  console.log('📖 See docs/auth/azure-ad-setup.md for setup instructions');
  console.log('📋 See docs/auth/redirect-uris-reference.md for quick reference\n');
  process.exit(1);
} else {
  console.log('\n✅ All authentication configuration is valid!\n');
  console.log('Next steps:');
  console.log('  1. Ensure Azure AD apps have matching redirect URIs registered');
  console.log('  2. Run: pnpm build && pnpm swa:start');
  console.log('  3. Navigate to: http://localhost:4280');
  console.log('  4. Test sign-in flow\n');
  console.log('📖 See docs/auth/CONFIGURATION-UPDATE.md for testing scenarios\n');
  process.exit(0);
}
