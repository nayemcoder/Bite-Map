// vite.config.js
import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/customers': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/sellers': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/restaurants': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/bookings': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // <-- newly added
      '/seller/bookings': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/notifications': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // end new entries
    },
  },
});