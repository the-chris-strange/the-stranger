import '@dotenvx/dotenvx/config'

import path from 'node:path'

import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

import manifest from './package.json'

const external: string[] = Object.keys({
  ...manifest.dependencies,
  ...manifest.peerDependencies,
})

export default defineConfig(() => ({
  build: {
    emptyOutDir: true,
    lib: {
      entry: {
        index: 'src/index.ts',
      },
      formats: ['es' as const],
      name: 'eslint-plugin',
    },
    outDir: '../../dist/packages/eslint-plugin',
    reportCompressedSize: true,
    rollupOptions: { external },
    target: ['node24'],
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
      provider: 'v8' as const,
      reportsDirectory: '../../coverage/packages/eslint-plugin',
    },
    environment: 'node',
    globals: false,
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    name: 'eslint-plugin',
    typecheck: {
      include: [
        'src/**/*.{test,spec}-d.?(c|m)[jt]s?(x)',
        'src/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      ],
    },
    watch: false,
  },
}))
