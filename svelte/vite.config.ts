import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  base: '/formBuilder2/svelte/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        componentLibrary: resolve(__dirname, 'componentLibrary.html'),
        waitingListCard: resolve(__dirname, 'waitingListCard.html'),
        operationNote: resolve(__dirname, 'operationNote.html'),
        outpatientOutcome: resolve(__dirname, 'outpatientOutcome.html'),
        treatmentSummary: resolve(__dirname, 'treatmentSummary.html'),
        cardiologyTestRequest: resolve(__dirname, 'cardiologyTestRequest.html'),
        patientRegistry: resolve(__dirname, 'patientRegistry.html'),
        patientSearch: resolve(__dirname, 'patientSearch.html'),
        patientRecord: resolve(__dirname, 'patientRecord.html'),
        composer: resolve(__dirname, 'composer.html'),
        caseNoteTracker: resolve(__dirname, 'caseNoteTracker.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    proxy: {
      '/formBuilder2/api': {
        target: 'http://127.0.0.1:3210',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/formBuilder2\/api/, '/api'),
      },
    },
  },
});
