import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import tailwindcss from '@tailwindcss/vite';

/**
 * Billing Remote App Configuration
 * 
 * Deployment paths:
 *   - Development: http://localhost:5001/
 *   - Production:  https://oneportal.azurestaticapps.net/billing/
 */
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    federation({
      name: 'billing',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
        './bootstrap': './src/bootstrap',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  base: process.env.NODE_ENV === 'production' ? '/billing/' : '/',
  server: {
    port: 5001,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 4174,
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
