import path from 'node:path'

import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import dotenv from 'dotenv'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

dotenv.config()

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: {
        index: 'src/index.ts',
      },
      formats: ['es'],
      name: 'prettier-config',
    },
    outDir: '../../dist/packages/prettier-config',
    reportCompressedSize: true,
    rollupOptions: {},
    target: ['node22'],
  },

  cacheDir: '../../node_modules/.vite/packages/prettier-config',

  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(import.meta.dirname, 'tsconfig.lib.json'),
    }),
  ],

  root: import.meta.dirname,

  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/packages/prettier-config',
    },
    environment: 'node',
    globals: false,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    name: 'prettier-config',
    passWithNoTests: true,
    typecheck: {
      include: [
        'src/**/*.{test,spec}-d.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
    },
    watch: false,
  },
})
