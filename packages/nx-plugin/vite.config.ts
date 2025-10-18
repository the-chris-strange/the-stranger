import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig(() => ({
  cacheDir: '../../node_modules/.vite/packages/nx-plugin',

  plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],

  root: __dirname,

  test: {
    coverage: {
      exclude: ['src/tests/**'],
      provider: 'v8' as const,
      reportsDirectory: '../../coverage/packages/nx-plugin',
    },
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    name: 'nx-plugin',
    reporters: ['default'],
    typecheck: {
      include: [
        'src/**/*.{test,spec}.?(c|m)[jt]s?(x)',
        'src/**/*.{test,spec}-d.?(c|m)[jt]s?(x)',
      ],
      tsconfig: 'tsconfig.spec.json',
    },
    watch: false,
  },
}))
