import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  cacheDir: '../../node_modules/.vite/packages/nx-plugin',

  plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],

  root: __dirname,

  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/packages/nx-plugin',
    },
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    name: 'nx-plugin',
    reporters: ['default'],
    watch: false,
  },
})
