import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

import { FilePatterns, getFilePatterns } from '../patterns'

export async function vitestConfig(): Promise<FlatConfig.ConfigArray> {
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
    return []
  }
}

/**
 * Default configuration for [@vitest/eslint-plugin](https://github.com/vitest-dev/eslint-plugin-vitest#readme).
 */
export default await vitestConfig()
