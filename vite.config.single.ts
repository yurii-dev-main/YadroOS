import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  define: {
    __DEMO_SINGLEFILE__: JSON.stringify(true)
  },
  transformIndexHtml: (html) =>
    html
      .replace(/<link\s+rel="manifest"[^>]*>\s*/i, '')
      .replace(/<link\s+rel="apple-touch-icon"[^>]*>\s*/i, ''),
  plugins: [
    react(),
    viteSingleFile({
      removeViteModuleLoader: true
    })
  ],
  build: {
    target: 'esnext',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined
      }
    }
  }
});
