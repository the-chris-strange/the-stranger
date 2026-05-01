import { defineConfig } from 'vitest/config'

const projectPath = 'packages/eslint-utils' as const
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
    globals: true,
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    name: 'eslint-utils',
    reporters: [
      'default',
      process.env['GITHUB_ACTIONS'] === 'true' || process.env['CI']
        ? 'github-actions'
        : {},
      ['json', { outputFile: `${cacheDir}/test-results.json` }],
    ],
    typecheck: {
      include: [
        'src/**/*.{test,spec}-d.?(c|m)[jt]s?(x)',
        'src/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      ],
    },
    watch: false,
  },
}))
