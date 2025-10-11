import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import tailwindcss from '@tailwindcss/vite';

/**
 * Reports Remote App Configuration
 * 
 * Deployment paths:
 *   - Development: http://localhost:5002/
 *   - Production:  https://oneportal.azurestaticapps.net/reports/
 */
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    federation({
      name: 'reports',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
        './bootstrap': './src/bootstrap',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  base: process.env.NODE_ENV === 'production' ? '/reports/' : '/',
  server: {
    port: 5002,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 4175,
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
