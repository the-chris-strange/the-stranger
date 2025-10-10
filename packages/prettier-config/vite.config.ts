import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig(() => ({
  cacheDir: '../../node_modules/.vite/packages/prettier-config',

  plugins: [nxViteTsPaths()],

  root: import.meta.dirname,

  test: {
    coverage: {
      exclude: ['src/test/**'],
      provider: 'v8' as const,
      reportsDirectory: '../../coverage/packages/prettier-config',
    },
    environment: 'node',
    globals: false,
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    name: 'prettier-config',
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
