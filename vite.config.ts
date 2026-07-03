import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import devFilePlugin from './dev/vite-plugin-dev-file.js';
import {resolve} from 'path';

const entryPoints = {
  main: resolve(__dirname, 'src/main.tsx'),
  "bulk-handler": resolve(__dirname, 'src/legacy/js/bulk-handler.js'),
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devFilePlugin(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, '../src/shared')
    },
  },
  build: {
    outDir: 'build',
    emptyOutDir: typeof process.env.WATCH === 'undefined',
    manifest: 'manifest.json',
    chunkSizeWarningLimit: 2000,
    rolldownOptions: {
      input: entryPoints,
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name]-[hash][extname]';
          }
          return 'build/[name]-[hash][extname]';
        },
      },
    },
    // Generate source maps in development
    sourcemap: process.env.NODE_ENV === 'development',
    // Minify in production
    minify: process.env.NODE_ENV === 'production',
  },
  server: {
    open: false,
    cors: true,
  },
});
