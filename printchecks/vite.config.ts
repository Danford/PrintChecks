import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/lib/index.ts', import.meta.url)),
      name: 'PrintChecks',
      formats: ['es', 'umd'],
      fileName: (format) => `printchecks.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'pinia', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia',
          'vue-router': 'VueRouter'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'printchecks.css'
          }
          return 'assets/[name][extname]'
        }
      }
    }
  }
})
