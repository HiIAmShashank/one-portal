import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import federation from '@originjs/vite-plugin-federation';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

/**
 * Module Federation Configuration for OnePortal Shell
 * 
 * DEPLOYMENT MODEL: Single Azure Static Web App
 * 
 * All apps (shell, billing, reports) are deployed to the same Azure Static Web App:
 *   - Shell:   https://oneportal.azurestaticapps.net/
 *   - Billing: https://oneportal.azurestaticapps.net/billing/
 *   - Reports: https://oneportal.azurestaticapps.net/reports/
 * 
 * Local Development:
 *   - Shell:   http://localhost:5000/
 *   - Billing: http://localhost:5001/
 *   - Reports: http://localhost:5002/
 * 
 * The base URL is determined by environment:
 *   - Development: Different ports for hot reload
 *   - Production: Same origin, different paths
 */

const isDev = process.env.NODE_ENV === 'development';

const remotes = isDev
  ? {
      // Development: Each app on different port for Vite HMR
      billing: 'http://localhost:5001/assets/remoteEntry.js',
      reports: 'http://localhost:5002/assets/remoteEntry.js',
    }
  : {
      // Production: Same origin, different paths (Azure Static Web App)
      billing: '/billing/assets/remoteEntry.js',
      reports: '/reports/assets/remoteEntry.js',
    };

export default defineConfig({
  plugins: [
    tsconfigPaths({ projects: ['../../packages/ui'] }),
    tailwindcss(),
    tanstackRouter(),
    react(),
    federation({
      name: 'shell',
      remotes,
      // CRITICAL: React/React-DOM are shared as singletons across all apps
      // MSAL packages are NOT shared - each app has its own instance with unique client ID
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 5000,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
    cors: true,
  },
  build: {
    target: 'esnext',
    modulePreload: false,
    minify: false,
    cssCodeSplit: false,
  },
});
