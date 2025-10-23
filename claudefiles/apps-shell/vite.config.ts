import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import federation from '@originjs/vite-plugin-federation';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

// Configure remotes based on what actually exists in the codebase
const remotes = isDev
  ? {
      domino: 'http://localhost:5173/assets/remoteEntry.js',
    }
  : {
      domino: '/domino/assets/remoteEntry.js',
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
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^19.2.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.2.0',
        },
        '@tanstack/react-query': {
          singleton: true,
        },
        zustand: {
          singleton: true,
        },
      },
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
