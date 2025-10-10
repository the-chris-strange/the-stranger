import { FilePatterns, getFilePatterns, namer } from '@the-stranger/eslint-plugin/utils'
import vitest from '@vitest/eslint-plugin'
import { defineConfig } from 'eslint/config'

import type { Linter } from 'eslint'

export default defineConfig(
  vitest.configs['recommended'] as any as Linter.Config,

  {
    files: getFilePatterns(FilePatterns.test),
    name: namer('vitest'),
    rules: {
      'vitest/consistent-test-it': ['error', { fn: 'it' }],
      'vitest/prefer-hooks-in-order': 'warn',
      'vitest/valid-title': ['warn', { disallowedWords: ['should'] }],
    },
  },
)
