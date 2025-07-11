import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

// Vite config for both renderer and Electron main process.
import { resolve } from 'path';

export default defineConfig({
  root: 'src/renderer',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    electron({
      // Entry file for Electron main process (TypeScript)
      entry: '../../electron/main.ts',
      // Configure build output for main process so it ends up in dist/electron
      vite: {
        build: {
          outDir: '../../dist/electron',
          emptyOutDir: false,
          lib: {
            entry: '../../electron/main.ts',
            formats: ['cjs'],
          },
        },
      },
    }),
  ],
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: false,
  },
});
