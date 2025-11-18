import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true // 👈 esto permite que rutas como /profiles funcionen al recargar
  }
});
