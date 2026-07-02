import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: process.env.FB_LIBRARY_OUT_DIR || 'compiled/formBuilder2',
    emptyOutDir: false,
    copyPublicDir: false,
    cssCodeSplit: true,
    minify: false,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/entry/index.tsx'),
        implants: resolve(__dirname, 'src/entry/implants.tsx'),
        outpatientOutcomes: resolve(__dirname, 'src/entry/outpatientOutcomes.tsx'),
        caseNoteTracker: resolve(__dirname, 'src/entry/caseNoteTracker.tsx'),
        components: resolve(__dirname, 'src/entry/components.tsx'),
        composer: resolve(__dirname, 'src/entry/composer.tsx'),
        cardiologyTestRequest: resolve(__dirname, 'src/entry/cardiologyTestRequest.tsx'),
        userForm: resolve(__dirname, 'src/entry/userForm.tsx'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
