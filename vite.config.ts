import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDemo = mode === 'demo';

  return {
    base: './',
    clearScreen: false,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3001,
      open: false,
      strictPort: true,
    },
    define: {
      'import.meta.env.VITE_DEMO_MODE': JSON.stringify(isDemo ? 'true' : env.VITE_DEMO_MODE),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            markdown: ['react-markdown'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});
