import { ConfigBuilder } from '../config'
import { FilePatterns, getFilePatterns } from '../patterns'

export const vitestConfig: ConfigBuilder = async () => {
  try {
    const vitest = await import('@vitest/eslint-plugin')
    return [
      vitest.default.configs['recommended'],

      {
        files: getFilePatterns(FilePatterns.test),
        rules: {
          'vitest/consistent-test-it': ['error', { fn: 'it' }],
          'vitest/prefer-hooks-in-order': 'warn',
          'vitest/valid-title': ['warn', { disallowedWords: ['should'] }],
        },
      },
    ]
  } catch {
    return
  }
}
