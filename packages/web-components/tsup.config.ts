import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs', 'iife'],
  globalName: 'PrintChecksWebComponents',
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  target: 'es2020',
  external: ['@printchecks/core'],
})
