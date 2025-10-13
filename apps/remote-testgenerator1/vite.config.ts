import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    federation({
      name: 'testgenerator1',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
        './bootstrap': './src/bootstrap.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  base: process.env.NODE_ENV === 'production' ? '/testgenerator1/' : '/',
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'esm',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
