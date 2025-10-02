import vitest from '@vitest/eslint-plugin'
import type { Linter } from 'eslint'
import { defineConfig } from 'eslint/config'
import { namer } from '../namer'
import { FilePatterns, getFilePatterns } from '../patterns'

export default defineConfig(
  vitest.configs['recommended'] as any as Linter.Config,

  {
    name: namer('vitest'),
    files: getFilePatterns(FilePatterns.test),
    rules: {
      'vitest/consistent-test-it': ['error', { fn: 'it' }],
      'vitest/prefer-hooks-in-order': 'warn',
      'vitest/valid-title': ['warn', { disallowedWords: ['should'] }],
    },
  },
)
