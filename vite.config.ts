import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const siteRoot = __dirname;

export default defineConfig({
  root: siteRoot,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(siteRoot, 'src'),
    },
  },
  publicDir: path.resolve(siteRoot, 'public'),
  build: {
    outDir: path.resolve(siteRoot, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: path.resolve(siteRoot, 'index.html'),
    },
  },
  server: {
    host: process.env.TYPE1SKILLS_HOST || '127.0.0.1',
    port: Number(process.env.TYPE1SKILLS_PORT || 3301),
    strictPort: true,
  },
  preview: {
    host: process.env.TYPE1SKILLS_HOST || '127.0.0.1',
    port: Number(process.env.TYPE1SKILLS_PREVIEW_PORT || 4175),
    strictPort: true,
  },
});
