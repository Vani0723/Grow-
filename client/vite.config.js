import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to backend during development
    proxy: {
      '/api': {
        target: process.env.VITE_CLIENT_URL ? process.env.VITE_CLIENT_URL.replace(/\/:$/, '') : 'http://localhost:5002',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ['@hello-pangea/dnd'],
  },
});
