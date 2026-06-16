import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Origin only — path /api/v1/... from the app is appended as-is
        target: 'https://sobat.nodeteam.site',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
