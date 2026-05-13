import { defineConfig } from 'vitest/config'

const projectPath = 'tools/nx-plugin' as const
const cacheDir = `../../node_modules/.vitest/${projectPath}` as const

export default defineConfig(() => ({
  cacheDir,

  root: __dirname,

  test: {
    coverage: {
      exclude: ['src/test/**'],
      provider: 'v8' as const,
      reportsDirectory: `../../coverage/${projectPath}`,
    },
    environment: 'node',
    globals: false,
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    name: 'nx-plugin-internal',
    reporters: [
      'default',
      process.env['GITHUB_ACTIONS'] === 'true' || process.env['CI']
        ? 'github-actions'
        : {},
      ['json', { outputFile: `${cacheDir}/test-results.json` }],
    ],
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
