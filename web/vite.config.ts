import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const WEB_PORT = Number(process.env.ADMIN_PORT) || 80;

export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'API_'], // Allow API_ variables to be exposed
  server: {
    port: WEB_PORT,
  },
});
