import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_PORT = process.env.API_PORT || '6150';
const DEV_PORT = Number(process.env.ADMIN_PORT) || 6151;

export default defineConfig({
  plugins: [react()],
  server: {
    port: DEV_PORT,
    proxy: {
      '/admin': `http://localhost:${API_PORT}`,
      '/api': `http://localhost:${API_PORT}`,
    },
  },
});
