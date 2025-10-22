import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [
    tanstackRouter(),
    react(),
    tailwindcss(),
    federation({
      name: 'domino',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
        './bootstrap': './src/bootstrap.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  base: process.env.NODE_ENV === 'production' ? '/domino/' : '/',
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
