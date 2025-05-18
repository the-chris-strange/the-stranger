import path from 'node:path'

import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import dotenv from 'dotenv'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

import manifest from './package.json'

dotenv.config()

const external: string[] = Object.entries({
  ...manifest.dependencies,
  // ...manifest.devDependencies,
  ...manifest.peerDependencies,
}).map(([key, _]) => key)

export default defineConfig({
  build: {
    // commonjsOptions: {
    //   transformMixedEsModules: false,
    // },
    emptyOutDir: true,
    lib: {
      entry: {
        'index': 'src/index.ts',
        'nx-dependency-checks': 'src/nx-dependency-checks.ts',
      },
      formats: ['es'],
      name: 'eslint-plugin',
    },
    outDir: '../../dist/packages/eslint-plugin',
    reportCompressedSize: true,
    rollupOptions: {
      external,
    },
    target: ['node22'],
  },

  cacheDir: '../../node_modules/.vite/packages/eslint-plugin',

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
      reportsDirectory: '../../coverage/packages/eslint-plugin',
    },
    environment: 'node',
    globals: false,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    name: 'eslint-plugin',
    typecheck: {
      include: [
        'src/**/*.{test,spec}-d.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
    },
    watch: false,
  },
})
