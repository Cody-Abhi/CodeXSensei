import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Vite config. The client lives in `src/client` and is built to `dist/client`,
 * which the Express server serves in production. In dev, `/api` is proxied to
 * the Express server on port 8080.
 */
export default defineConfig({
  root: 'src/client',
  plugins: [react()],
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: false,
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
