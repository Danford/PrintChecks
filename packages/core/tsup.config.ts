import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'models/index': 'src/models/index.ts',
    'services/index': 'src/services/index.ts',
    'storage/index': 'src/storage/index.ts',
    'utils/index': 'src/utils/index.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  external: ['to-words']
})
