import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    root: __dirname,
    base: '/formBuilder2/reactOrig/',
    plugins: [react(), tailwindcss()],
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify: file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: [
          '**/.mock-formbuilder2-db.json',
          '**/.mock-server.log',
          '**/.mock-server.err.log',
          '**/formbuilder2-mock-db.json',
          '**/compiled/**',
          '**/dist/**',
          'formBuilder2/**',
          '**/*.log',
          '**/*.pid',
        ],
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html'),
          implants: resolve(__dirname, 'implants.html'),
          outpatientOutcomes: resolve(__dirname, 'outpatientOutcomes.html'),
          components: resolve(__dirname, 'components.html'),
          caseNoteTracker: resolve(__dirname, 'caseNoteTracker.html'),
        },
      },
    },
  };
});
