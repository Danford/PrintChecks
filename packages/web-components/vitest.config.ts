import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@printchecks/core': path.resolve(__dirname, 'src/__tests__/mocks/core.ts'),
    },
  },
})
