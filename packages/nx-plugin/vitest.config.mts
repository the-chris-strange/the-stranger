import { defineConfig } from 'vitest/config'

import { workspaceAliases } from '../../tools/vitest-workspace.mjs'

const name = 'nx-plugin' as const
const projectPath = `packages/${name}` as const
const cacheDir = `../../node_modules/.vitest/${projectPath}` as const

export default defineConfig(() => ({
  cacheDir,
  resolve: { alias: workspaceAliases },

  root: import.meta.dirname,

  test: {
    coverage: {
      exclude: ['src/test/**'],
      provider: 'v8' as const,
      reportsDirectory: `../../coverage/${projectPath}`,
    },
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    name,
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
