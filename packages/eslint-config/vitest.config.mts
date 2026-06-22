import { defineConfig } from 'vitest/config'

const name = 'eslint-config' as const
const projectPath = `packages/${name}` as const
const cacheDir = `../../node_modules/.vitest/${projectPath}` as const

export default defineConfig(() => ({
  cacheDir,

  root: import.meta.dirname,

  test: {
    coverage: {
      provider: 'v8' as const,
      reportsDirectory: `../../coverage/${projectPath}`,
    },
    environment: 'node',
    globals: false,
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    name,
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
