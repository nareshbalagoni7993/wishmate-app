/**
 * WHY: Vite config sets up the dev server with API proxy (avoids CORS in development)
 *      and configures React plugin for Fast Refresh.
 * HOW: Proxy /api/* to http://localhost:5000 so the React app treats the backend
 *      as same-origin. In production, nginx/caddy handles this.
 * PRODUCTION STANDARD: Never hard-code API URLs in frontend code. Use env vars.
 * PERFORMANCE: build.rollupOptions.output enables code splitting by vendor/app.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          charts: ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
