import path from 'node:path'

import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import dotenv from 'dotenv'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

dotenv.config()

export default defineConfig({
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['es', 'cjs'],
      name: 'yarn-config',
    },
    outDir: '../../dist/packages/yarn-config',
    reportCompressedSize: true,
    rollupOptions: { external: [] },
  },

  cacheDir: '../../node_modules/.vite/packages/yarn-config',

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
      reportsDirectory: '../../coverage/packages/yarn-config',
    },
    environment: 'node',
    globals: false,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    name: 'yarn-config',
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
