import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig(() => ({
  cacheDir: '../../node_modules/.vite/packages/yarn-config',

  plugins: [nxViteTsPaths()],

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
