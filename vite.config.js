import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'public/manifest.json', dest: '.' },   // Copy manifest from public folder
        { src: 'public/assets', dest: '.' },          // Copy icons
        { src: 'public/background.js', dest: '.' }    // Copy background script
      ]
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep the assets in the assets directory
          if (assetInfo.name.endsWith('.png') || assetInfo.name.endsWith('.svg') || 
              assetInfo.name.endsWith('.jpg') || assetInfo.name.endsWith('.jpeg')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name].[hash][extname]';
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
});
