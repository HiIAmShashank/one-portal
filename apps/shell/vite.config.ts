import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import federation from '@originjs/vite-plugin-federation';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

const remotes = isDev
  ? {
    billing: 'http://localhost:5001/assets/remoteEntry.js',
    reports: 'http://localhost:5002/assets/remoteEntry.js',
  }
  : {
    billing: '/billing/assets/remoteEntry.js',
    reports: '/reports/assets/remoteEntry.js',
  };

export default defineConfig({
  plugins: [
    tsconfigPaths({ projects: ['../../packages/ui'] }),
    tailwindcss(),
    tanstackRouter(),
    react(),
    {
      name: 'hmr-logger',
      handleHotUpdate({ file, server }) {
        console.log(`[Shell HMR] File changed: ${file}`);
        return;
      },
    },
    federation({
      name: 'shell',
      remotes,
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
