import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // All Alloy traffic goes through the Express backend so credentials
    // never touch the browser.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
