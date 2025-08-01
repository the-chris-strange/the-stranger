import '@dotenvx/dotenvx/config'

import path from 'node:path'

import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

export default defineConfig(() => ({
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['es' as const, 'cjs' as const],
      name: 'yarn-config',
    },
    outDir: '../../dist/packages/yarn-config',
    reportCompressedSize: true,
    target: ['node24'],
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
      provider: 'v8' as const,
      reportsDirectory: '../../coverage/packages/yarn-config',
    },
    environment: 'node',
    globals: false,
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    name: 'yarn-config',
    passWithNoTests: true,
    typecheck: {
      include: [
        'src/**/*.{test,spec}-d.?(c|m)[jt]s?(x)',
        'src/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      ],
    },
    watch: false,
  },
}))
