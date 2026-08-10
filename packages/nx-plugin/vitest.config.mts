import { defineConfig } from 'vitest/config'

const name = 'nx-plugin' as const
const projectPath = `packages/${name}` as const
const cacheDir = `../../node_modules/.vitest/${projectPath}` as const

export default defineConfig(() => ({
  cacheDir,

  root: import.meta.dirname,

  test: {
    coverage: {
      exclude: ['src/test/**', 'src/**/*.d.ts'],
      include: ['src/**/*.ts'],
      reportsDirectory: `../../.test-output/coverage/${projectPath}`,
    },
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
